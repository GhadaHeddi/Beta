"""
Service metier pour la gestion des agences
"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.models.agency import Agency, UserAgency
from app.models.project import Project, ProjectStatus


def create_agency(
    db: Session,
    name: str,
    address: Optional[str] = None,
    city: Optional[str] = None,
    postal_code: Optional[str] = None,
    phone: Optional[str] = None,
    email: Optional[str] = None,
) -> Agency:
    """Cree une nouvelle agence."""
    agency = Agency(
        name=name,
        address=address,
        city=city,
        postal_code=postal_code,
        phone=phone,
        email=email,
    )
    db.add(agency)
    db.commit()
    db.refresh(agency)
    return agency


def get_agency_by_id(db: Session, agency_id: int) -> Optional[Agency]:
    """Recupere une agence par son ID."""
    return db.query(Agency).filter(Agency.id == agency_id).first()


def get_all_agencies(db: Session) -> List[Agency]:
    """Recupere toutes les agences."""
    return db.query(Agency).order_by(Agency.name).all()


def get_agencies_for_user(db: Session, user_id: int) -> List[Agency]:
    """Recupere les agences d'un utilisateur via la table de jointure."""
    return (
        db.query(Agency)
        .join(UserAgency, UserAgency.agency_id == Agency.id)
        .filter(UserAgency.user_id == user_id)
        .order_by(Agency.name)
        .all()
    )


def add_user_to_agency(
    db: Session, user_id: int, agency_id: int, is_primary: bool = False
) -> UserAgency:
    """Rattache un utilisateur a une agence."""
    # Verifier si l'association existe deja
    existing = (
        db.query(UserAgency)
        .filter(UserAgency.user_id == user_id, UserAgency.agency_id == agency_id)
        .first()
    )
    if existing:
        existing.is_primary = is_primary
        db.commit()
        db.refresh(existing)
        return existing

    # Si is_primary, retirer le flag primary des autres associations
    if is_primary:
        db.query(UserAgency).filter(
            UserAgency.user_id == user_id, UserAgency.is_primary == True
        ).update({"is_primary": False})

    user_agency = UserAgency(
        user_id=user_id,
        agency_id=agency_id,
        is_primary=is_primary,
    )
    db.add(user_agency)
    db.commit()
    db.refresh(user_agency)
    return user_agency


def remove_user_from_agency(db: Session, user_id: int, agency_id: int) -> bool:
    """Detache un utilisateur d'une agence."""
    result = (
        db.query(UserAgency)
        .filter(UserAgency.user_id == user_id, UserAgency.agency_id == agency_id)
        .delete()
    )
    db.commit()
    return result > 0


def get_primary_agency_for_user(db: Session, user_id: int) -> Optional[Agency]:
    """Recupere l'agence principale d'un utilisateur."""
    user_agency = (
        db.query(UserAgency)
        .filter(UserAgency.user_id == user_id, UserAgency.is_primary == True)
        .first()
    )
    if user_agency:
        return db.query(Agency).filter(Agency.id == user_agency.agency_id).first()

    # Fallback: premiere agence
    user_agency = (
        db.query(UserAgency)
        .filter(UserAgency.user_id == user_id)
        .first()
    )
    if user_agency:
        return db.query(Agency).filter(Agency.id == user_agency.agency_id).first()

    return None


def get_agency_stats(db: Session, agency_id: int) -> dict:
    """Calcule les statistiques d'une agence."""
    consultants_count = (
        db.query(func.count(UserAgency.id))
        .filter(UserAgency.agency_id == agency_id)
        .scalar()
    )

    projects_count = (
        db.query(func.count(Project.id))
        .filter(Project.agency_id == agency_id, Project.deleted_at.is_(None))
        .scalar()
    )

    projects_in_progress = (
        db.query(func.count(Project.id))
        .filter(
            Project.agency_id == agency_id,
            Project.deleted_at.is_(None),
            Project.status == ProjectStatus.IN_PROGRESS,
        )
        .scalar()
    )

    projects_completed = (
        db.query(func.count(Project.id))
        .filter(
            Project.agency_id == agency_id,
            Project.deleted_at.is_(None),
            Project.status == ProjectStatus.COMPLETED,
        )
        .scalar()
    )

    return {
        "consultants_count": consultants_count or 0,
        "projects_count": projects_count or 0,
        "projects_in_progress": projects_in_progress or 0,
        "projects_completed": projects_completed or 0,
    }
