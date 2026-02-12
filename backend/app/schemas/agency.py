"""
Schemas Pydantic pour les agences
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class AgencyCreate(BaseModel):
    """Schema pour creer une agence"""
    name: str
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None


class AgencyUpdate(BaseModel):
    """Schema pour modifier une agence (tous les champs optionnels)"""
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None


class AgencyResponse(BaseModel):
    """Schema de reponse agence"""
    id: int
    name: str
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AgencyBrief(BaseModel):
    """Schema agence simplifie"""
    id: int
    name: str
    city: Optional[str] = None

    class Config:
        from_attributes = True


class AgencyWithStats(AgencyResponse):
    """Schema agence avec statistiques"""
    consultants_count: int = 0
    projects_count: int = 0
    projects_in_progress: int = 0
    projects_completed: int = 0

    class Config:
        from_attributes = True


class UserAgencyAdd(BaseModel):
    """Schema pour rattacher un utilisateur a une agence"""
    user_id: int
    is_primary: bool = False
