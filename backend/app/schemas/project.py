"""
Schémas Pydantic pour les projets
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Tuple
from datetime import datetime
from app.models.project import ProjectStatus, PropertyType
from app.schemas.user import UserBrief
from app.schemas.property_info import PropertyInfoBrief


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
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProjectWithOwner(ProjectResponse):
    """Projet avec informations du propriétaire"""
    user: UserBrief

    class Config:
        from_attributes = True


class ProjectWithDetails(ProjectResponse):
    """Projet avec propriétaire et infos du bien"""
    user: UserBrief
    property_info: Optional[PropertyInfoBrief] = None

    class Config:
        from_attributes = True


class ProjectList(BaseModel):
    """Liste de projets paginée"""
    items: List[ProjectResponse]
    total: int


# === Schémas de partage ===

class ProjectShareCreate(BaseModel):
    """Schéma pour partager un projet"""
    user_id: Optional[int] = None  # Optionnel si on utilise email
    email: Optional[str] = None    # Recherche par email
    permission: str = "write"      # "read", "write", "admin"


class ProjectShareUpdate(BaseModel):
    """Schéma pour modifier un partage"""
    permission: str  # "read", "write", "admin"


class ProjectShareResponse(BaseModel):
    """Réponse de partage"""
    id: int
    project_id: int
    user_id: int
    can_write: bool
    permission: str
    created_at: Optional[datetime] = None
    user: Optional[UserBrief] = None

    class Config:
        from_attributes = True


# === Schémas pour filtrage et pagination ===

class FiltersMetadata(BaseModel):
    """Métadonnées pour les options de filtres"""
    available_cities: List[str]
    available_consultants: List[UserBrief]
    construction_year_range: Tuple[Optional[int], Optional[int]]
    property_type_counts: dict[str, int]


class ProjectsPaginatedResponse(BaseModel):
    """Réponse paginée pour la liste des projets"""
    projects: List[ProjectWithDetails]
    total: int
    page: int
    page_size: int
    total_pages: int
    filters_metadata: Optional[FiltersMetadata] = None

    class Config:
        from_attributes = True
