"""
Routes des zones géographiques - Recherche autocomplete
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.models.geographic_zone import GeographicZone
from app.schemas.geographic_zone import GeographicZoneResponse

router = APIRouter(prefix="/geographic-zones", tags=["Zones géographiques"])


@router.get("/dev/search", response_model=List[GeographicZoneResponse])
def search_zones(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
):
    """
    Recherche des zones géographiques dont le nom contient le texte saisi.
    Retourne les zones triées par pertinence (match exact en premier, puis partiel).
    """
    search_term = q.strip().lower()
    zones = (
        db.query(GeographicZone)
        .filter(func.lower(GeographicZone.name).contains(search_term))
        .order_by(
            # Priorité : les noms qui commencent par le terme en premier
            func.lower(GeographicZone.name).startswith(search_term).desc(),
            GeographicZone.name,
        )
        .limit(10)
        .all()
    )
    return zones
