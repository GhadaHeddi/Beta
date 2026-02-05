"""
Schémas Pydantic pour PropertyInfo
"""
from pydantic import BaseModel
from typing import Optional


class PropertyInfoBrief(BaseModel):
    """Schéma simplifié pour la liste des projets"""
    total_surface: Optional[float] = None
    occupant_name: Optional[str] = None
    construction_year: Optional[int] = None

    class Config:
        from_attributes = True
