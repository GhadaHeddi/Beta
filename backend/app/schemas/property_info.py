"""
Schémas Pydantic pour PropertyInfo
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PropertyInfoBrief(BaseModel):
    """Schéma simplifié pour la liste des projets"""
    total_surface: Optional[float] = None
    occupant_name: Optional[str] = None
    construction_year: Optional[int] = None

    class Config:
        from_attributes = True


class PropertyInfoUpdate(BaseModel):
    """Schéma pour créer ou mettre à jour les informations du bien"""
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

    # Localisation géographique
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

    # Notes libres
    notes: Optional[str] = None


class PropertyInfoResponse(BaseModel):
    """Schéma de réponse pour PropertyInfo"""
    id: int
    project_id: int

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

    # Localisation géographique
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

    # Notes libres
    notes: Optional[str] = None

    # Métadonnées
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
