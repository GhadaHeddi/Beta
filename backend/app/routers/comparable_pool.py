"""
Routes du pool de comparables - Ajout rapide
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from app.database import get_db
from app.services.comparable_service import quick_add_comparable


router = APIRouter(prefix="/comparable-pool", tags=["ComparablePool"])


# === Pydantic Schemas ===

class QuickAddRequest(BaseModel):
    """Schema de requete pour l'ajout rapide d'un comparable"""
    project_id: int
    address: str
    surface: float
    price: float
    construction_year: Optional[int] = None


class QuickAddResponse(BaseModel):
    """Schema de reponse pour l'ajout rapide"""
    id: int
    address: str
    latitude: float
    longitude: float
    surface: float
    price: float
    price_per_m2: float
    property_type: str
    source: str
    status: str
    construction_year: Optional[int]
    transaction_date: Optional[str]

    class Config:
        from_attributes = True


# === Routes DEV (sans authentification) ===

@router.post("/dev/quick-add", response_model=QuickAddResponse, status_code=status.HTTP_201_CREATED)
async def quick_add_comparable_dev(
    data: QuickAddRequest,
    db: Session = Depends(get_db)
):
    """
    [DEV ONLY] Ajout rapide d'un bien comparable sans authentification.
    Geocode l'adresse via Nominatim et cree le bien dans le pool.
    """
    result = quick_add_comparable(
        db=db,
        project_id=data.project_id,
        address=data.address,
        surface=data.surface,
        price=data.price,
        construction_year=data.construction_year
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Impossible de geocoder cette adresse ou projet non trouve"
        )

    return {
        "id": result.id,
        "address": result.address,
        "latitude": result.latitude,
        "longitude": result.longitude,
        "surface": result.surface,
        "price": result.price,
        "price_per_m2": result.price_per_m2,
        "property_type": result.property_type,
        "source": result.source.value if hasattr(result.source, 'value') else result.source,
        "status": result.status if isinstance(result.status, str) else result.status,
        "construction_year": result.construction_year,
        "transaction_date": result.transaction_date.isoformat() if result.transaction_date else None,
    }
