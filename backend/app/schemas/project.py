"""
Schémas Pydantic pour les projets
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.project import ProjectStatus, PropertyType
from app.schemas.user import UserBrief


# === Schémas de base ===

class ProjectBase(BaseModel):
    title: str
    address: str
    property_type: PropertyType


# === Schémas de création/mise à jour ===

class ProjectCreate(ProjectBase):
    """Schéma pour créer un projet"""
    pass


class ProjectUpdate(BaseModel):
    """Schéma pour modifier un projet"""
    title: Optional[str] = None
    address: Optional[str] = None
    property_type: Optional[PropertyType] = None
    status: Optional[ProjectStatus] = None
    current_step: Optional[int] = None


# === Schémas de réponse ===

class ProjectResponse(ProjectBase):
    """Schéma de réponse projet"""
    id: int
    user_id: int
    status: ProjectStatus
    current_step: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProjectWithOwner(ProjectResponse):
    """Projet avec informations du propriétaire"""
    user: UserBrief

    class Config:
        from_attributes = True


class ProjectList(BaseModel):
    """Liste de projets paginée"""
    items: List[ProjectResponse]
    total: int


# === Schémas de partage ===

class ProjectShareCreate(BaseModel):
    """Schéma pour partager un projet"""
    user_id: int
    can_write: bool = True


class ProjectShareResponse(BaseModel):
    """Réponse de partage"""
    id: int
    project_id: int
    user_id: int
    can_write: bool
    created_at: Optional[datetime] = None
    user: Optional[UserBrief] = None

    class Config:
        from_attributes = True
