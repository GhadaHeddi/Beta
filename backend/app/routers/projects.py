"""
Routes des projets - CRUD avec gestion des permissions de partage
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import List
from app.database import get_db
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectWithOwner,
    ProjectWithDetails,
    ProjectShareCreate,
    ProjectShareResponse,
)
from app.utils.security import get_current_user, get_user_admin_id
from app.models import User, Project, ProjectShare, UserRole, PropertyInfo

router = APIRouter(prefix="/projects", tags=["Projets"])


# === Endpoint temporaire de test (sans authentification) ===

@router.get("/dev/all", response_model=List[ProjectWithDetails])
async def list_all_projects_dev(db: Session = Depends(get_db)):
    """
    [DEV ONLY] Liste tous les projets sans authentification.
    À SUPPRIMER avant la mise en production.
    """
    projects = (
        db.query(Project)
        .options(
            joinedload(Project.user),
            joinedload(Project.property_info)
        )
        .order_by(Project.updated_at.desc())
        .all()
    )
    return projects


# === Helpers pour les permissions ===

def get_team_user_ids(db: Session, user: User) -> List[int]:
    """Retourne les IDs de tous les utilisateurs de l'équipe (admin + consultants)."""
    if user.role == UserRole.ADMIN:
        # Admin : lui-même + tous ses consultants
        consultants = db.query(User).filter(User.admin_id == user.id).all()
        return [user.id] + [c.id for c in consultants]
    else:
        # Consultant : son admin + tous les consultants du même admin
        admin = db.query(User).filter(User.id == user.admin_id).first()
        if admin:
            consultants = db.query(User).filter(User.admin_id == admin.id).all()
            return [admin.id] + [c.id for c in consultants]
        return [user.id]


def can_read_project(db: Session, user: User, project: Project) -> bool:
    """Vérifie si l'utilisateur peut lire le projet."""
    # Propriétaire
    if project.user_id == user.id:
        return True

    # Admin du propriétaire
    if user.role == UserRole.ADMIN:
        owner = db.query(User).filter(User.id == project.user_id).first()
        if owner and (owner.admin_id == user.id or owner.id == user.id):
            return True

    # Même équipe (consultants du même admin)
    team_ids = get_team_user_ids(db, user)
    if project.user_id in team_ids:
        return True

    # Projet partagé avec l'utilisateur
    share = db.query(ProjectShare).filter(
        ProjectShare.project_id == project.id,
        ProjectShare.user_id == user.id
    ).first()
    if share:
        return True

    return False


def can_write_project(db: Session, user: User, project: Project) -> bool:
    """Vérifie si l'utilisateur peut modifier le projet."""
    # Propriétaire
    if project.user_id == user.id:
        return True

    # Admin du propriétaire
    if user.role == UserRole.ADMIN:
        owner = db.query(User).filter(User.id == project.user_id).first()
        if owner and (owner.admin_id == user.id or owner.id == user.id):
            return True

    # Partage avec droit d'écriture
    share = db.query(ProjectShare).filter(
        ProjectShare.project_id == project.id,
        ProjectShare.user_id == user.id,
        ProjectShare.can_write == True
    ).first()
    if share:
        return True

    return False


def can_delete_project(db: Session, user: User, project: Project) -> bool:
    """Vérifie si l'utilisateur peut supprimer le projet."""
    # Propriétaire
    if project.user_id == user.id:
        return True

    # Admin du propriétaire
    if user.role == UserRole.ADMIN:
        owner = db.query(User).filter(User.id == project.user_id).first()
        if owner and (owner.admin_id == user.id or owner.id == user.id):
            return True

    return False


# === Routes CRUD ===

@router.get("/", response_model=List[ProjectWithDetails])
async def list_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Liste tous les projets accessibles par l'utilisateur.

    - Admin : tous les projets de son équipe
    - Consultant : ses projets + projets de l'équipe (lecture)

    Inclut les informations du propriétaire et du bien (PropertyInfo).
    """
    team_ids = get_team_user_ids(db, current_user)

    # Projets de l'équipe + projets partagés avec l'utilisateur
    projects = (
        db.query(Project)
        .options(
            joinedload(Project.user),
            joinedload(Project.property_info)
        )
        .filter(
            or_(
                Project.user_id.in_(team_ids),
                Project.id.in_(
                    db.query(ProjectShare.project_id).filter(
                        ProjectShare.user_id == current_user.id
                    )
                )
            )
        )
        .order_by(Project.updated_at.desc())
        .all()
    )

    return projects


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Crée un nouveau projet.

    - **title**: Titre du projet
    - **address**: Adresse du bien
    - **property_type**: Type de bien (OFFICE, WAREHOUSE, RETAIL, INDUSTRIAL, LAND, MIXED)
    """
    project = Project(
        user_id=current_user.id,
        title=project_data.title,
        address=project_data.address,
        property_type=project_data.property_type,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("/{project_id}", response_model=ProjectWithOwner)
async def get_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Récupère les détails d'un projet.
    """
    project = (
        db.query(Project)
        .options(joinedload(Project.user))
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projet non trouvé"
        )

    if not can_read_project(db, current_user, project):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas accès à ce projet"
        )

    return project


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Modifie un projet existant.

    Requiert d'être propriétaire, admin de l'équipe, ou collaborateur avec droit d'écriture.
    """
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projet non trouvé"
        )

    if not can_write_project(db, current_user, project):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas le droit de modifier ce projet"
        )

    # Appliquer les modifications
    update_data = project_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Supprime un projet.

    Seul le propriétaire ou l'admin de l'équipe peut supprimer un projet.
    """
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projet non trouvé"
        )

    if not can_delete_project(db, current_user, project):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas le droit de supprimer ce projet"
        )

    db.delete(project)
    db.commit()


# === Routes de partage ===

@router.get("/{project_id}/shares", response_model=List[ProjectShareResponse])
async def list_project_shares(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Liste les collaborateurs d'un projet.
    """
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projet non trouvé"
        )

    if not can_read_project(db, current_user, project):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas accès à ce projet"
        )

    shares = (
        db.query(ProjectShare)
        .options(joinedload(ProjectShare.user))
        .filter(ProjectShare.project_id == project_id)
        .all()
    )

    return shares


@router.post("/{project_id}/shares", response_model=ProjectShareResponse, status_code=status.HTTP_201_CREATED)
async def share_project(
    project_id: int,
    share_data: ProjectShareCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Partage un projet avec un autre utilisateur.

    Seul le propriétaire peut partager son projet.

    - **user_id**: ID de l'utilisateur à qui partager
    - **can_write**: Autoriser l'écriture (défaut: true)
    """
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projet non trouvé"
        )

    # Seul le propriétaire peut partager
    if project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seul le propriétaire peut partager ce projet"
        )

    # Vérifier que l'utilisateur cible existe
    target_user = db.query(User).filter(User.id == share_data.user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur cible non trouvé"
        )

    # Vérifier que l'utilisateur fait partie de l'équipe
    team_ids = get_team_user_ids(db, current_user)
    if share_data.user_id not in team_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vous ne pouvez partager qu'avec les membres de votre équipe"
        )

    # Vérifier qu'il n'existe pas déjà un partage
    existing_share = db.query(ProjectShare).filter(
        ProjectShare.project_id == project_id,
        ProjectShare.user_id == share_data.user_id
    ).first()

    if existing_share:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ce projet est déjà partagé avec cet utilisateur"
        )

    # Créer le partage
    share = ProjectShare(
        project_id=project_id,
        user_id=share_data.user_id,
        can_write=share_data.can_write
    )
    db.add(share)
    db.commit()
    db.refresh(share)

    # Charger l'utilisateur pour la réponse
    share = (
        db.query(ProjectShare)
        .options(joinedload(ProjectShare.user))
        .filter(ProjectShare.id == share.id)
        .first()
    )

    return share


@router.delete("/{project_id}/shares/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_project_share(
    project_id: int,
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retire un collaborateur d'un projet.

    Seul le propriétaire peut retirer des collaborateurs.
    """
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projet non trouvé"
        )

    # Seul le propriétaire peut retirer des partages
    if project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seul le propriétaire peut gérer les partages"
        )

    share = db.query(ProjectShare).filter(
        ProjectShare.project_id == project_id,
        ProjectShare.user_id == user_id
    ).first()

    if not share:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partage non trouvé"
        )

    db.delete(share)
    db.commit()
