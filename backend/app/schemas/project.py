"""
Schemas Pydantic pour Project - Validation et sérialisation
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum


class PropertyType(str, Enum):
    """Types de biens immobiliers"""
    OFFICE = "office"
    WAREHOUSE = "warehouse"
    RETAIL = "retail"
    INDUSTRIAL = "industrial"
    LAND = "land"
    MIXED = "mixed"


class ProjectStatus(str, Enum):
    """Statuts possibles d'un projet"""
    DRAFT = "draft"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class ProjectBase(BaseModel):
    """Schema de base pour Project"""
    title: str
    address: str
    property_type: PropertyType


class ProjectCreate(ProjectBase):
    """Schema pour la création d'un projet"""
    pass


class ProjectUpdate(BaseModel):
    """Schema pour la mise à jour d'un projet"""
    title: Optional[str] = None
    address: Optional[str] = None
    property_type: Optional[PropertyType] = None
    status: Optional[ProjectStatus] = None
    current_step: Optional[int] = None


class ProjectResponse(ProjectBase):
    """Schema pour la réponse projet"""
    id: int
    user_id: int
    status: ProjectStatus
    current_step: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectListResponse(BaseModel):
    """Schema pour la liste des projets"""
    projects: list[ProjectResponse]
    total: int


# Property Info schemas

class PropertyInfoBase(BaseModel):
    """Schema de base pour PropertyInfo"""
    # Informations propriétaire/occupant
    owner_name: Optional[str] = None
    owner_contact: Optional[str] = None
    occupant_name: Optional[str] = None
    occupant_contact: Optional[str] = None

    # Caractéristiques du bien
    construction_year: Optional[int] = None
    materials: Optional[str] = None
    total_surface: Optional[float] = None
    terrain_surface: Optional[float] = None
    number_of_floors: Optional[int] = None
    parking_spaces: Optional[int] = None

    # Localisation
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    postal_code: Optional[str] = None
    city: Optional[str] = None
    geographic_sector: Optional[str] = None

    # Environnement PLU
    plu_zone: Optional[str] = None
    plu_regulation: Optional[str] = None
    oap: Optional[str] = None
    servitudes: Optional[str] = None
    flood_zones: Optional[str] = None

    # Analyse SWOT
    swot_strengths: Optional[str] = None
    swot_weaknesses: Optional[str] = None
    swot_opportunities: Optional[str] = None
    swot_threats: Optional[str] = None

    # Notes
    notes: Optional[str] = None


class PropertyInfoUpdate(PropertyInfoBase):
    """Schema pour la mise à jour des infos propriété"""
    pass


class PropertyInfoResponse(PropertyInfoBase):
    """Schema pour la réponse PropertyInfo"""
    id: int
    project_id: int

    class Config:
        from_attributes = True
