"""
Routes d'administration - Gestion des consultants et dashboard
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.schemas.user import ConsultantCreate, UserResponse
from app.services.user import (
    get_consultants_by_admin,
    get_user_by_id,
    get_user_by_email,
    create_consultant,
    delete_consultant,
)
from app.utils.security import require_admin
from app.models import User, Project, ProjectStatus

router = APIRouter(prefix="/admin", tags=["Administration"])


@router.get("/consultants", response_model=List[UserResponse])
async def list_consultants(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Liste tous les consultants de l'administrateur connecté.
    """
    consultants = get_consultants_by_admin(db, admin_id=admin.id)
    return consultants


@router.post("/consultants", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_new_consultant(
    consultant_data: ConsultantCreate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Crée un nouveau consultant rattaché à l'administrateur connecté.

    - **email**: Email unique du consultant
    - **password**: Mot de passe
    - **first_name**: Prénom
    - **last_name**: Nom
    - **phone**: Téléphone (optionnel)
    """
    # Vérifier que l'email n'existe pas déjà
    existing_user = get_user_by_email(db, email=consultant_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un utilisateur avec cet email existe déjà"
        )

    # Créer le consultant
    consultant = create_consultant(db, admin_id=admin.id, consultant_data=consultant_data)
    return consultant


@router.delete("/consultants/{consultant_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_consultant(
    consultant_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Supprime un consultant de l'équipe de l'administrateur.

    Le consultant et tous ses projets seront supprimés.
    """
    # Vérifier que le consultant existe
    consultant = get_user_by_id(db, user_id=consultant_id)
    if not consultant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultant non trouvé"
        )

    # Vérifier que c'est bien un consultant de cet admin
    if consultant.admin_id != admin.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Ce consultant n'appartient pas à votre équipe"
        )

    # Supprimer le consultant
    delete_consultant(db, consultant_id=consultant_id)


@router.get("/dashboard")
async def get_dashboard(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Retourne les statistiques du dashboard administrateur.

    - Nombre de consultants
    - Nombre de projets par statut
    - Projets récents
    """
    # Nombre de consultants
    consultants = get_consultants_by_admin(db, admin_id=admin.id)
    consultant_ids = [c.id for c in consultants]

    # Projets de l'admin et de ses consultants
    all_user_ids = [admin.id] + consultant_ids

    # Statistiques des projets par statut
    project_stats = (
        db.query(Project.status, func.count(Project.id))
        .filter(Project.user_id.in_(all_user_ids))
        .group_by(Project.status)
        .all()
    )

    status_counts = {status.value if status else "null": count for status, count in project_stats}

    # Total des projets
    total_projects = sum(status_counts.values())

    # Projets récents (5 derniers)
    recent_projects = (
        db.query(Project)
        .filter(Project.user_id.in_(all_user_ids))
        .order_by(Project.created_at.desc())
        .limit(5)
        .all()
    )

    recent_projects_data = [
        {
            "id": p.id,
            "title": p.title,
            "address": p.address,
            "status": p.status.value if p.status else None,
            "owner_id": p.user_id,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        }
        for p in recent_projects
    ]

    return {
        "consultants_count": len(consultants),
        "projects_count": total_projects,
        "projects_by_status": status_counts,
        "recent_projects": recent_projects_data,
    }
