"""
Service de gestion des utilisateurs
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models import User, UserRole
from app.schemas import ConsultantCreate
from app.services.auth import hash_password


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Récupère un utilisateur par son ID"""
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Récupère un utilisateur par son email"""
    return db.query(User).filter(User.email == email).first()


def get_consultants_by_admin(db: Session, admin_id: int) -> List[User]:
    """Récupère tous les consultants d'un admin"""
    return db.query(User).filter(
        User.admin_id == admin_id,
        User.role == UserRole.CONSULTANT
    ).all()


def create_consultant(db: Session, consultant_data: ConsultantCreate, admin_id: int) -> User:
    """
    Crée un nouveau consultant.

    Args:
        db: Session de base de données
        consultant_data: Données du consultant
        admin_id: ID de l'administrateur qui crée le consultant

    Returns:
        Le consultant créé
    """
    consultant = User(
        email=consultant_data.email,
        password_hash=hash_password(consultant_data.password),
        first_name=consultant_data.first_name,
        last_name=consultant_data.last_name,
        phone=consultant_data.phone,
        role=UserRole.CONSULTANT,
        admin_id=admin_id
    )

    db.add(consultant)
    db.commit()
    db.refresh(consultant)

    return consultant


def delete_consultant(db: Session, consultant_id: int, admin_id: int) -> bool:
    """
    Supprime un consultant.

    Args:
        db: Session de base de données
        consultant_id: ID du consultant à supprimer
        admin_id: ID de l'admin (pour vérification)

    Returns:
        True si supprimé, False sinon
    """
    consultant = db.query(User).filter(
        User.id == consultant_id,
        User.admin_id == admin_id,
        User.role == UserRole.CONSULTANT
    ).first()

    if not consultant:
        return False

    db.delete(consultant)
    db.commit()

    return True


def update_user(db: Session, user: User, update_data: dict) -> User:
    """Met à jour les champs d'un utilisateur"""
    for field, value in update_data.items():
        if hasattr(user, field):
            setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


def get_admin_for_user(db: Session, user: User) -> Optional[User]:
    """
    Récupère l'admin associé à un utilisateur.
    Si l'utilisateur est admin, retourne lui-même.
    """
    if user.role == UserRole.ADMIN:
        return user
    return user.admin
