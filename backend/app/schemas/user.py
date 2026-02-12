"""
Schémas Pydantic pour les utilisateurs
"""
import re
from pydantic import BaseModel, EmailStr, field_validator
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
    agency_id: Optional[int] = None


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
    agency_id: Optional[int] = None
    agency_name: Optional[str] = None
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


class ChangePasswordRequest(BaseModel):
    """Requête de changement de mot de passe"""
    current_password: str
    new_password: str
    confirm_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Le mot de passe doit contenir au moins 8 caractères")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Le mot de passe doit contenir au moins une lettre majuscule")
        if not re.search(r"[a-z]", v):
            raise ValueError("Le mot de passe doit contenir au moins une lettre minuscule")
        if not re.search(r"\d", v):
            raise ValueError("Le mot de passe doit contenir au moins un chiffre")
        return v

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        if "new_password" in info.data and v != info.data["new_password"]:
            raise ValueError("Les mots de passe ne correspondent pas")
        return v
