"""
Routes des biens comparables - Recherche et selection
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import date
from app.database import get_db
from app.utils.security import get_current_user
from app.models import User, Project, Comparable
from app.services.comparable_service import (
    search_comparables,
    get_selected_comparables,
    select_comparable_from_pool,
    deselect_comparable,
    update_comparable_adjustment,
    update_comparable_fields,
    validate_project_comparables,
    ensure_property_coordinates,
    ComparableSearchParams
)


router = APIRouter(prefix="/projects/{project_id}/comparables", tags=["Comparables"])


# === Pydantic Schemas ===

class ComparablePoolResponse(BaseModel):
    """Schema de reponse pour un comparable du pool"""
    id: int
    address: str
    postal_code: Optional[str]
    city: Optional[str]
    latitude: float
    longitude: float
    property_type: str
    surface: float
    construction_year: Optional[int]
    transaction_type: str
    price: float
    price_per_m2: float
    transaction_date: Optional[str]
    source: str
    source_reference: Optional[str]
    photo_url: Optional[str]
    status: Optional[str] = "transaction"
    distance_km: Optional[float]

    class Config:
        from_attributes = True


class PriceStatsResponse(BaseModel):
    """Schema de reponse pour les statistiques de prix"""
    avg_rent_per_m2: Optional[float]
    rent_count: int
    avg_sale_per_m2: Optional[float]
    sale_count: int
    latest_sale_per_m2: Optional[float]
    latest_sale_date: Optional[str]
    total_count: int


class CenterResponse(BaseModel):
    """Schema pour les coordonnees du centre"""
    lat: float
    lng: float


class PerimeterStatsResponse(BaseModel):
    """Schema de reponse pour les stats d'un perimetre geographique"""
    label: str
    avg_rent_per_m2: Optional[float]
    avg_sale_per_m2: Optional[float]
    total_count: int


class ComparableSearchResponse(BaseModel):
    """Schema de reponse pour la recherche de comparables"""
    comparables: List[ComparablePoolResponse]
    stats: PriceStatsResponse
    perimeter_stats: List[PerimeterStatsResponse] = []
    center: Optional[CenterResponse]


class SelectedComparableResponse(BaseModel):
    """Schema de reponse pour un comparable selectionne"""
    id: int
    address: str
    postal_code: Optional[str]
    city: Optional[str]
    surface: float
    construction_year: Optional[int]
    price: float
    price_per_m2: float
    latitude: Optional[float]
    longitude: Optional[float]
    distance: Optional[float]
    transaction_date: Optional[date]
    adjustment: float
    adjusted_price_per_m2: Optional[float]
    validated: bool
    validation_notes: Optional[str]
    source: Optional[str]
    source_reference: Optional[str]

    class Config:
        from_attributes = True


class SelectComparableRequest(BaseModel):
    """Schema de requete pour selectionner un comparable"""
    comparable_pool_id: int
    adjustment: float = 0.0
    notes: Optional[str] = None


class UpdateAdjustmentRequest(BaseModel):
    """Schema de requete pour mettre a jour un ajustement"""
    adjustment: float


class UpdateComparableFieldsRequest(BaseModel):
    """Schema de requete pour mettre a jour les champs d'un comparable"""
    surface: Optional[float] = None
    price: Optional[float] = None
    price_per_m2: Optional[float] = None
    construction_year: Optional[int] = None


# === Routes ===

@router.get("/search", response_model=ComparableSearchResponse)
async def search_comparable_properties(
    project_id: int,
    surface_min: Optional[float] = Query(None, description="Surface minimum en m2"),
    surface_max: Optional[float] = Query(None, description="Surface maximum en m2"),
    year_min: Optional[int] = Query(None, description="Annee de construction minimum"),
    year_max: Optional[int] = Query(None, description="Annee de construction maximum"),
    distance_km: float = Query(5.0, ge=0.1, le=50, description="Rayon de recherche en km"),
    source: Optional[str] = Query("all", description="Source: all, arthur_loyd, concurrence"),
    comparable_status: Optional[str] = Query("all", description="Statut: all, transaction, disponible"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Recherche des biens comparables dans le pool selon les filtres.
    Le filtre par type de bien est automatique (meme type que le bien evalue).
    """
    # Verifier que le projet existe et que l'utilisateur y a acces
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projet non trouve"
        )

    # Construire les parametres de recherche
    params = ComparableSearchParams(
        surface_min=surface_min,
        surface_max=surface_max,
        year_min=year_min,
        year_max=year_max,
        distance_km=distance_km,
        source=source,
        status=comparable_status
    )

    # Effectuer la recherche
    result = search_comparables(db, project_id, params)

    return result


@router.get("/selected", response_model=List[SelectedComparableResponse])
async def list_selected_comparables(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Liste les comparables selectionnes et valides pour ce projet.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projet non trouve"
        )

    comparables = get_selected_comparables(db, project_id)
    return comparables


@router.post("/select", response_model=SelectedComparableResponse, status_code=status.HTTP_201_CREATED)
async def select_comparable(
    project_id: int,
    data: SelectComparableRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Selectionne un comparable du pool pour ce projet.
    Maximum 3 comparables peuvent etre selectionnes par projet.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projet non trouve"
        )

    comparable = select_comparable_from_pool(
        db,
        project_id,
        data.comparable_pool_id,
        data.adjustment,
        data.notes
    )

    if not comparable:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comparable non trouve dans le pool ou deja selectionne"
        )

    return comparable


@router.delete("/select/{comparable_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_comparable(
    project_id: int,
    comparable_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retire un comparable de la selection du projet.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projet non trouve"
        )

    success = deselect_comparable(db, project_id, comparable_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comparable non trouve"
        )

    return None


@router.put("/select/{comparable_id}/adjustment", response_model=SelectedComparableResponse)
async def update_adjustment(
    project_id: int,
    comparable_id: int,
    data: UpdateAdjustmentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Met a jour l'ajustement d'un comparable selectionne.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projet non trouve"
        )

    comparable = update_comparable_adjustment(
        db, project_id, comparable_id, data.adjustment
    )

    if not comparable:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comparable non trouve"
        )

    return comparable


@router.post("/validate")
async def validate_comparables(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Valide les comparables selectionnes et passe a l'etape suivante.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projet non trouve"
        )

    # Verifier qu'il y a au moins un comparable selectionne
    selected_count = db.query(Comparable).filter(
        Comparable.project_id == project_id,
        Comparable.validated == True
    ).count()

    if selected_count == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Selectionnez au moins un comparable avant de valider"
        )

    success = validate_project_comparables(db, project_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la validation"
        )

    return {
        "message": "Comparables valides avec succes",
        "current_step": 3,
        "selected_count": selected_count
    }


# === Routes DEV (sans authentification) ===

@router.get("/dev/search", response_model=ComparableSearchResponse)
async def search_comparable_properties_dev(
    project_id: int,
    surface_min: Optional[float] = Query(None),
    surface_max: Optional[float] = Query(None),
    year_min: Optional[int] = Query(None),
    year_max: Optional[int] = Query(None),
    distance_km: float = Query(5.0, ge=0.1, le=50),
    source: Optional[str] = Query("all"),
    comparable_status: Optional[str] = Query("all"),
    db: Session = Depends(get_db)
):
    """
    [DEV ONLY] Recherche de comparables sans authentification.
    A SUPPRIMER avant la mise en production.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projet non trouve"
        )

    # Geocoder automatiquement si pas de coordonnees
    ensure_property_coordinates(db, project_id)

    params = ComparableSearchParams(
        surface_min=surface_min,
        surface_max=surface_max,
        year_min=year_min,
        year_max=year_max,
        distance_km=distance_km,
        source=source,
        status=comparable_status
    )

    result = search_comparables(db, project_id, params)
    return result


@router.get("/dev/selected", response_model=List[SelectedComparableResponse])
async def list_selected_comparables_dev(
    project_id: int,
    db: Session = Depends(get_db)
):
    """
    [DEV ONLY] Liste des comparables selectionnes sans authentification.
    A SUPPRIMER avant la mise en production.
    """
    comparables = get_selected_comparables(db, project_id)
    return comparables


@router.post("/dev/select", response_model=SelectedComparableResponse, status_code=status.HTTP_201_CREATED)
async def select_comparable_dev(
    project_id: int,
    data: SelectComparableRequest,
    db: Session = Depends(get_db)
):
    """
    [DEV ONLY] Selection de comparable sans authentification.
    A SUPPRIMER avant la mise en production.
    """
    comparable = select_comparable_from_pool(
        db,
        project_id,
        data.comparable_pool_id,
        data.adjustment,
        data.notes
    )

    if not comparable:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erreur lors de la selection (max 3 atteint ou comparable non trouve)"
        )

    return comparable


@router.delete("/dev/select/{comparable_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_comparable_dev(
    project_id: int,
    comparable_id: int,
    db: Session = Depends(get_db)
):
    """
    [DEV ONLY] Suppression de comparable sans authentification.
    A SUPPRIMER avant la mise en production.
    """
    success = deselect_comparable(db, project_id, comparable_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comparable non trouve"
        )
    return None


@router.patch("/dev/select/{comparable_id}", response_model=SelectedComparableResponse)
async def update_comparable_fields_dev(
    project_id: int,
    comparable_id: int,
    data: UpdateComparableFieldsRequest,
    db: Session = Depends(get_db)
):
    """
    [DEV ONLY] Mise a jour des champs d'un comparable sans authentification.
    Permet de corriger surface, prix ou annee de construction.
    """
    comparable = update_comparable_fields(
        db, project_id, comparable_id,
        surface=data.surface,
        price=data.price,
        price_per_m2=data.price_per_m2,
        construction_year=data.construction_year
    )

    if not comparable:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comparable non trouve"
        )

    return comparable
