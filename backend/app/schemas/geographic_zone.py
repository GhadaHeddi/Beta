"""
Schemas Pydantic pour les zones géographiques
"""
from pydantic import BaseModel
from typing import Optional


class GeographicZoneResponse(BaseModel):
    id: int
    name: str
    agency_id: int

    class Config:
        from_attributes = True
