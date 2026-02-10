"""
Schémas Pydantic pour les utilisateurs
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.user import UserRole


# === Schémas de base ===

class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    phone: Optional[str] = None


# === Schémas de création ===

class ConsultantCreate(UserBase):
    """Schéma pour créer un consultant (par l'admin)"""
    password: str


class UserUpdate(BaseModel):
    """Schéma pour la mise à jour du profil utilisateur"""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None


# === Schémas de réponse ===

class UserResponse(UserBase):
    """Schéma de réponse utilisateur"""
    id: int
    role: UserRole
    avatar_url: Optional[str] = None
    admin_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserBrief(BaseModel):
    """Schéma utilisateur simplifié"""
    id: int
    email: EmailStr
    first_name: str
    last_name: str
    role: UserRole

    class Config:
        from_attributes = True


# === Schémas d'authentification ===

class Token(BaseModel):
    """Réponse de token JWT"""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Données contenues dans le token"""
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None


class LoginRequest(BaseModel):
    """Requête de connexion"""
    email: EmailStr
    password: str
