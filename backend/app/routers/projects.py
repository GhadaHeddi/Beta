"""
Routes des projets - CRUD avec gestion des permissions de partage
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import List
from datetime import datetime
from app.database import get_db
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectWithOwner,
    ProjectWithDetails,
    ProjectShareCreate,
    ProjectShareUpdate,
    ProjectShareResponse,
)
from app.schemas.property_info import PropertyInfoUpdate, PropertyInfoResponse
from app.utils.security import get_current_user, get_user_admin_id
from app.models import User, Project, ProjectShare, UserRole, PropertyInfo
from app.models.project_share import SharePermission

router = APIRouter(prefix="/projects", tags=["Projets"])


# === Endpoint temporaire de test (sans authentification) ===

@router.get("/dev/all", response_model=List[ProjectWithDetails])
async def list_all_projects_dev(db: Session = Depends(get_db)):
    """
    [DEV ONLY] Liste tous les projets sans authentification.
    Exclut les projets dans la corbeille (deleted_at IS NOT NULL).
    À SUPPRIMER avant la mise en production.
    """
    projects = (
        db.query(Project)
        .options(
            joinedload(Project.user),
            joinedload(Project.property_info)
        )
        .filter(Project.deleted_at.is_(None))
        .order_by(Project.updated_at.desc())
        .all()
    )
    return projects


@router.post("/dev/create", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project_dev(
    project_data: ProjectCreate,
    db: Session = Depends(get_db)
):
    """
    [DEV ONLY] Crée un projet sans authentification.
    Utilise le premier utilisateur de la base par défaut.
    À SUPPRIMER avant la mise en production.
    """
    # Récupérer le premier utilisateur disponible
    default_user = db.query(User).first()
    if not default_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Aucun utilisateur en base. Créez d'abord un utilisateur."
        )

    project = Project(
        user_id=default_user.id,
        title=project_data.title,
        address=project_data.address,
        property_type=project_data.property_type,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("/dev/{project_id}", response_model=ProjectWithDetails)
async def get_project_dev(
    project_id: int,
    db: Session = Depends(get_db)
):
    """
    [DEV ONLY] Récupère un projet par son ID sans authentification.
    À SUPPRIMER avant la mise en production.
    """
    project = (
        db.query(Project)
        .options(
            joinedload(Project.user),
            joinedload(Project.property_info)
        )
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projet non trouvé"
        )

    return project


@router.put("/dev/{project_id}/property-info", response_model=PropertyInfoResponse)
async def update_property_info_dev(
    project_id: int,
    property_data: PropertyInfoUpdate,
    db: Session = Depends(get_db)
):
    """
    [DEV ONLY] Met à jour les informations du bien sans authentification.
    À SUPPRIMER avant la mise en production.
    """
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projet non trouvé"
        )

    if project.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ce projet est déjà dans la corbeille"
        )

    project.deleted_at = datetime.utcnow()
    db.commit()
    db.refresh(project)
    return project


@router.get("/dev/trash/all", response_model=List[ProjectWithDetails])
async def list_trash_projects_dev(db: Session = Depends(get_db)):
    """
    [DEV ONLY] Liste tous les projets dans la corbeille.
    À SUPPRIMER avant la mise en production.
    """
    projects = (
        db.query(Project)
        .options(
            joinedload(Project.user),
            joinedload(Project.property_info)
        )
        .filter(Project.deleted_at.isnot(None))
        .order_by(Project.deleted_at.desc())
        .all()
    )
    return projects


@router.delete("/dev/{project_id}", response_model=ProjectResponse)
async def soft_delete_project_dev(
    project_id: int,
    db: Session = Depends(get_db)
):
    """
    [DEV ONLY] Met à jour les informations du bien sans authentification.
    À SUPPRIMER avant la mise en production.
    """
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projet non trouvé"
        )

    if project.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ce projet est déjà dans la corbeille"
        )

    project.deleted_at = datetime.utcnow()
    db.commit()
    db.refresh(project)
    return project

@router.post("/dev/{project_id}/restore", response_model=ProjectResponse)
async def restore_project_dev(
    project_id: int,
    db: Session = Depends(get_db)
):
    """
    [DEV ONLY] Restaure un projet depuis la corbeille.
    À SUPPRIMER avant la mise en production.
    """
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projet non trouvé"
        )

    if project.deleted_at is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ce projet n'est pas dans la corbeille"
        )

    project.deleted_at = None
    db.commit()
    db.refresh(project)
    return project


@router.delete("/dev/{project_id}/permanent", status_code=status.HTTP_204_NO_CONTENT)
async def permanent_delete_project_dev(
    project_id: int,
    db: Session = Depends(get_db)
):
    """
    [DEV ONLY] Supprime définitivement un projet de la corbeille.
    Le projet doit être dans la corbeille pour être supprimé définitivement.
    À SUPPRIMER avant la mise en production.
    """
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projet non trouvé"
        )

    if project.deleted_at is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ce projet n'est pas dans la corbeille. Utilisez d'abord la suppression normale."
        )

    # Supprimer les partages associés
    db.query(ProjectShare).filter(ProjectShare.project_id == project_id).delete()

    # Supprimer le projet définitivement
    db.delete(project)
    db.commit()


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

    # Admin : accès à tous les projets de son équipe
    if user.role == UserRole.ADMIN:
        owner = db.query(User).filter(User.id == project.user_id).first()
        if owner and (owner.admin_id == user.id or owner.id == user.id):
            return True

    # Consultant : uniquement ses projets + projets partagés avec lui
    # (pas d'accès automatique aux projets de l'équipe)
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

    # Admin : accès complet aux projets de son équipe
    if user.role == UserRole.ADMIN:
        owner = db.query(User).filter(User.id == project.user_id).first()
        if owner and (owner.admin_id == user.id or owner.id == user.id):
            return True

    # Partage avec droit d'écriture ou admin
    share = db.query(ProjectShare).filter(
        ProjectShare.project_id == project.id,
        ProjectShare.user_id == user.id,
        ProjectShare.permission.in_(["write", "admin"])
    ).first()
    if share:
        return True

    return False


def can_delete_project(db: Session, user: User, project: Project) -> bool:
    """Vérifie si l'utilisateur peut supprimer le projet."""
    # Propriétaire
    if project.user_id == user.id:
        return True

    # Admin : accès complet aux projets de son équipe
    if user.role == UserRole.ADMIN:
        owner = db.query(User).filter(User.id == project.user_id).first()
        if owner and (owner.admin_id == user.id or owner.id == user.id):
            return True

    # Partage avec permission admin
    share = db.query(ProjectShare).filter(
        ProjectShare.project_id == project.id,
        ProjectShare.user_id == user.id,
        ProjectShare.permission == "admin"
    ).first()
    if share:
        return True

    return False


def can_share_project(db: Session, user: User, project: Project) -> bool:
    """Vérifie si l'utilisateur peut partager le projet."""
    # Propriétaire
    if project.user_id == user.id:
        return True

    # Admin : peut partager les projets de son équipe
    if user.role == UserRole.ADMIN:
        owner = db.query(User).filter(User.id == project.user_id).first()
        if owner and (owner.admin_id == user.id or owner.id == user.id):
            return True

    # Partage avec permission admin
    share = db.query(ProjectShare).filter(
        ProjectShare.project_id == project.id,
        ProjectShare.user_id == user.id,
        ProjectShare.permission == "admin"
    ).first()
    if share:
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
    - Consultant : ses propres projets + projets partagés avec lui

    Exclut les projets dans la corbeille.
    Inclut les informations du propriétaire et du bien (PropertyInfo).
    """
    if current_user.role == UserRole.ADMIN:
        # Admin : tous les projets de son équipe
        team_ids = get_team_user_ids(db, current_user)
        projects = (
            db.query(Project)
            .options(
                joinedload(Project.user),
                joinedload(Project.property_info)
            )
            .filter(
                Project.deleted_at.is_(None),
                Project.user_id.in_(team_ids)
            )
            .order_by(Project.updated_at.desc())
            .all()
        )
    else:
        # Consultant : ses propres projets + projets partagés avec lui
        projects = (
            db.query(Project)
            .options(
                joinedload(Project.user),
                joinedload(Project.property_info)
            )
            .filter(
                Project.deleted_at.is_(None),
                or_(
                    Project.user_id == current_user.id,
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


@router.delete("/{project_id}", response_model=ProjectResponse)
async def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Déplace un projet dans la corbeille (soft delete).

    Le projet sera définitivement supprimé après 15 jours.
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

    if project.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ce projet est déjà dans la corbeille"
        )

    project.deleted_at = datetime.utcnow()
    db.commit()
    db.refresh(project)
    return project


# === Routes PropertyInfo ===

@router.get("/{project_id}/property-info", response_model=PropertyInfoResponse)
async def get_property_info(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Récupère les informations détaillées du bien pour un projet.
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

    if not project.property_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Informations du bien non trouvées"
        )

    return project.property_info


@router.put("/{project_id}/property-info", response_model=PropertyInfoResponse)
async def update_property_info(
    project_id: int,
    property_data: PropertyInfoUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Crée ou met à jour les informations détaillées du bien.

    - **owner_name**: Nom du propriétaire
    - **occupant_name**: Nom de l'occupant
    - **construction_year**: Année de construction
    - **geographic_sector**: Secteur géographique
    - **swot_***: Analyse SWOT (forces, faiblesses, opportunités, menaces)
    - **notes**: Notes libres
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

    # Récupérer ou créer PropertyInfo
    property_info = project.property_info
    if not property_info:
        property_info = PropertyInfo(project_id=project_id)
        db.add(property_info)

    # Appliquer les modifications
    update_data = property_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(property_info, field, value)

    db.commit()
    db.refresh(property_info)
    return property_info


# === Routes de partage ===

@router.get("/{project_id}/available-users")
async def get_available_users_for_share(
    project_id: int,
    search: str = "",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Recherche les utilisateurs disponibles pour le partage d'un projet.

    - **search**: Terme de recherche (nom, prénom ou email)

    Retourne les membres de l'équipe qui n'ont pas encore accès au projet.
    """
    from app.schemas.user import UserBrief

    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projet non trouvé"
        )

    if not can_share_project(db, current_user, project):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas le droit de partager ce projet"
        )

    # Récupérer les IDs des utilisateurs qui ont déjà accès
    existing_share_user_ids = [
        s.user_id for s in db.query(ProjectShare).filter(
            ProjectShare.project_id == project_id
        ).all()
    ]

    # Ajouter le propriétaire et l'utilisateur courant
    excluded_ids = set(existing_share_user_ids + [project.user_id, current_user.id])

    # Récupérer les membres de l'équipe
    team_ids = get_team_user_ids(db, current_user)

    # Filtrer les utilisateurs disponibles
    query = db.query(User).filter(
        User.id.in_(team_ids),
        ~User.id.in_(excluded_ids)
    )

    # Appliquer le filtre de recherche si fourni
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                User.first_name.ilike(search_term),
                User.last_name.ilike(search_term),
                User.email.ilike(search_term)
            )
        )

    users = query.limit(10).all()

    return [
        {
            "id": u.id,
            "email": u.email,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "role": u.role.value
        }
        for u in users
    ]


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

    - **user_id**: ID de l'utilisateur à qui partager (optionnel si email fourni)
    - **email**: Email de l'utilisateur à qui partager (optionnel si user_id fourni)
    - **permission**: Niveau de permission ("read", "write", "admin")
    """
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projet non trouvé"
        )

    # Vérifier les droits de partage
    if not can_share_project(db, current_user, project):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas le droit de partager ce projet"
        )

    # Trouver l'utilisateur cible par ID ou email
    target_user = None
    if share_data.user_id:
        target_user = db.query(User).filter(User.id == share_data.user_id).first()
    elif share_data.email:
        target_user = db.query(User).filter(User.email == share_data.email).first()
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Veuillez fournir un user_id ou un email"
        )

    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )

    # Ne peut pas se partager à soi-même
    if target_user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vous ne pouvez pas partager un projet avec vous-même"
        )

    # Ne peut pas partager au propriétaire
    if target_user.id == project.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ce projet appartient déjà à cet utilisateur"
        )

    # Vérifier que l'utilisateur fait partie de l'équipe
    team_ids = get_team_user_ids(db, current_user)
    if target_user.id not in team_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vous ne pouvez partager qu'avec les membres de votre équipe"
        )

    # Valider le niveau de permission
    permission = share_data.permission.lower()
    if permission not in ["read", "write", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Permission invalide. Utilisez 'read', 'write' ou 'admin'"
        )

    # Vérifier qu'il n'existe pas déjà un partage
    existing_share = db.query(ProjectShare).filter(
        ProjectShare.project_id == project_id,
        ProjectShare.user_id == target_user.id
    ).first()

    if existing_share:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ce projet est déjà partagé avec cet utilisateur"
        )

    # Créer le partage
    can_write = permission in ["write", "admin"]
    share = ProjectShare(
        project_id=project_id,
        user_id=target_user.id,
        can_write=can_write,
        permission=permission
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


@router.put("/{project_id}/shares/{user_id}", response_model=ProjectShareResponse)
async def update_project_share(
    project_id: int,
    user_id: int,
    share_data: ProjectShareUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Modifie les permissions d'un partage existant.
    """
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projet non trouvé"
        )

    if not can_share_project(db, current_user, project):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas le droit de gérer les partages de ce projet"
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

    # Valider le niveau de permission
    permission = share_data.permission.lower()
    if permission not in ["read", "write", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Permission invalide. Utilisez 'read', 'write' ou 'admin'"
        )

    # Mettre à jour
    share.permission = permission
    share.can_write = permission in ["write", "admin"]
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
    """
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projet non trouvé"
        )

    if not can_share_project(db, current_user, project):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas le droit de gérer les partages de ce projet"
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


# === Routes de la corbeille ===

@router.get("/trash", response_model=List[ProjectWithDetails])
async def list_trash_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Liste les projets dans la corbeille.

    - Admin : voit tous les projets dans la corbeille (de son équipe)
    - Consultant : voit uniquement ses propres projets supprimés
    """
    if current_user.role == UserRole.ADMIN:
        # Admin : tous les projets supprimés de son équipe
        team_ids = get_team_user_ids(db, current_user)
        projects = (
            db.query(Project)
            .options(
                joinedload(Project.user),
                joinedload(Project.property_info)
            )
            .filter(
                Project.deleted_at.isnot(None),
                Project.user_id.in_(team_ids)
            )
            .order_by(Project.deleted_at.desc())
            .all()
        )
    else:
        # Consultant : uniquement ses propres projets supprimés
        projects = (
            db.query(Project)
            .options(
                joinedload(Project.user),
                joinedload(Project.property_info)
            )
            .filter(
                Project.deleted_at.isnot(None),
                Project.user_id == current_user.id
            )
            .order_by(Project.deleted_at.desc())
            .all()
        )

    return projects


@router.post("/{project_id}/restore", response_model=ProjectResponse)
async def restore_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Restaure un projet depuis la corbeille.

    Seul le propriétaire ou l'admin de l'équipe peut restaurer un projet.
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
            detail="Vous n'avez pas le droit de restaurer ce projet"
        )

    if project.deleted_at is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ce projet n'est pas dans la corbeille"
        )

    project.deleted_at = None
    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}/permanent", status_code=status.HTTP_204_NO_CONTENT)
async def permanent_delete_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Supprime définitivement un projet de la corbeille.

    Le projet doit être dans la corbeille pour être supprimé définitivement.
    Seul le propriétaire ou l'admin de l'équipe peut supprimer définitivement un projet.
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

    if project.deleted_at is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ce projet n'est pas dans la corbeille. Utilisez d'abord la suppression normale."
        )

    # Supprimer les partages associés
    db.query(ProjectShare).filter(ProjectShare.project_id == project_id).delete()

    # Supprimer le projet définitivement
    db.delete(project)
    db.commit()
