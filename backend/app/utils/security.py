"""
Utilitaires de sécurité - Dépendances FastAPI pour l'authentification
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserRole
from app.services.auth import decode_token
from app.services.user import get_user_by_id

# Configuration OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Dépendance FastAPI pour récupérer l'utilisateur connecté.

    Args:
        token: Token JWT depuis l'en-tête Authorization
        db: Session de base de données

    Returns:
        L'utilisateur authentifié

    Raises:
        HTTPException 401 si le token est invalide
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token invalide ou expiré",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Décoder le token
    payload = decode_token(token)
    if payload is None:
        raise credentials_exception

    user_id: int = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    # Récupérer l'utilisateur
    user = get_user_by_id(db, user_id=int(user_id))
    if user is None:
        raise credentials_exception

    return user


async def require_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dépendance FastAPI pour exiger un utilisateur admin.

    Args:
        current_user: Utilisateur connecté

    Returns:
        L'utilisateur admin

    Raises:
        HTTPException 403 si l'utilisateur n'est pas admin
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux administrateurs"
        )
    return current_user


def get_user_admin_id(user: User) -> int:
    """
    Retourne l'ID de l'admin pour un utilisateur.
    Si l'utilisateur est admin, retourne son propre ID.
    """
    if user.role == UserRole.ADMIN:
        return user.id
    return user.admin_id
