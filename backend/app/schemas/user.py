"""
Schemas Pydantic pour User - Validation et sérialisation
"""
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    """Schema de base pour User"""
    email: EmailStr
    first_name: str
    last_name: str
    phone: Optional[str] = None


class UserCreate(UserBase):
    """Schema pour la création d'un utilisateur"""
    password: str


class UserUpdate(BaseModel):
    """Schema pour la mise à jour d'un utilisateur"""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None


class UserResponse(UserBase):
    """Schema pour la réponse utilisateur"""
    id: int
    avatar_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    """Schema pour la connexion"""
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    """Schema pour la réponse d'authentification"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
