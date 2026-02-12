"""
Routes d'administration - Gestion des consultants et dashboard
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
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
from app.models.agency import UserAgency
from app.services.agency import add_user_to_agency, get_primary_agency_for_user

router = APIRouter(prefix="/admin", tags=["Administration"])


@router.get("/consultants", response_model=List[UserResponse])
async def list_consultants(
    agency_id: Optional[int] = Query(None, description="Filtrer par agence"),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Liste tous les consultants de l'administrateur connecté.
    Filtrable par agence si agency_id est fourni.
    """
    consultants = get_consultants_by_admin(db, admin_id=admin.id)

    if agency_id is not None:
        # Filtrer par agence
        agency_user_ids = {
            ua.user_id
            for ua in db.query(UserAgency).filter(UserAgency.agency_id == agency_id).all()
        }
        consultants = [c for c in consultants if c.id in agency_user_ids]

    # Enrichir avec agency_id et agency_name
    result = []
    for c in consultants:
        primary = get_primary_agency_for_user(db, c.id)
        user_dict = UserResponse.model_validate(c).model_dump()
        user_dict["agency_id"] = primary.id if primary else None
        user_dict["agency_name"] = primary.name if primary else None
        result.append(user_dict)

    return result


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

    # Associer le consultant a l'agence si agency_id fourni
    if consultant_data.agency_id:
        add_user_to_agency(db, user_id=consultant.id, agency_id=consultant_data.agency_id, is_primary=True)

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
    agency_id: Optional[int] = Query(None, description="Filtrer par agence"),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Retourne les statistiques du dashboard administrateur.

    - Nombre de consultants
    - Nombre de projets par statut
    - Projets récents
    - Filtrable par agence si agency_id est fourni
    """
    # Nombre de consultants
    consultants = get_consultants_by_admin(db, admin_id=admin.id)
    consultant_ids = [c.id for c in consultants]

    # Filtrer par agence si specifie
    if agency_id is not None:
        agency_user_ids = {
            ua.user_id
            for ua in db.query(UserAgency).filter(UserAgency.agency_id == agency_id).all()
        }
        filtered_consultant_ids = [cid for cid in consultant_ids if cid in agency_user_ids]
        # Inclure l'admin seulement s'il est dans cette agence
        all_user_ids = filtered_consultant_ids
        if admin.id in agency_user_ids:
            all_user_ids = [admin.id] + filtered_consultant_ids
        consultants_count = len(filtered_consultant_ids)
    else:
        all_user_ids = [admin.id] + consultant_ids
        consultants_count = len(consultants)

    # Statistiques des projets par statut
    project_query = db.query(Project.status, func.count(Project.id)).filter(
        Project.deleted_at.is_(None)
    )
    if agency_id is not None:
        project_query = project_query.filter(Project.agency_id == agency_id)
    else:
        project_query = project_query.filter(Project.user_id.in_(all_user_ids))

    project_stats = project_query.group_by(Project.status).all()
    status_counts = {status.value if status else "null": count for status, count in project_stats}

    # Total des projets
    total_projects = sum(status_counts.values())

    # Projets récents (5 derniers)
    recent_query = db.query(Project).filter(Project.deleted_at.is_(None))
    if agency_id is not None:
        recent_query = recent_query.filter(Project.agency_id == agency_id)
    else:
        recent_query = recent_query.filter(Project.user_id.in_(all_user_ids))

    recent_projects = recent_query.order_by(Project.created_at.desc()).limit(5).all()

    recent_projects_data = [
        {
            "id": p.id,
            "title": p.title,
            "address": p.address,
            "status": p.status.value if p.status else None,
            "owner_id": p.user_id,
            "agency_id": p.agency_id,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        }
        for p in recent_projects
    ]

    return {
        "consultants_count": consultants_count,
        "projects_count": total_projects,
        "projects_by_status": status_counts,
        "recent_projects": recent_projects_data,
    }
