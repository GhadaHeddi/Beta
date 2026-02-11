"""
Routes pour l'étape Analyse - Tableau de synthèse et estimations de marché
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.utils.security import get_current_user
from app.models import User, Project, PropertyBreakdown, MarketEstimation
from app.schemas.analysis import (
    PropertyBreakdownCreate,
    PropertyBreakdownUpdate,
    PropertyBreakdownResponse,
    PropertyBreakdownBulk,
    MarketEstimationUpdate,
    MarketEstimationResponse,
)
from app.routers.projects import can_read_project, can_write_project


router = APIRouter(prefix="/projects/{project_id}/analysis", tags=["Analysis"])


# === Helpers ===

def get_project_or_404(db: Session, project_id: int) -> Project:
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.deleted_at.is_(None)
    ).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projet non trouvé"
        )
    return project


# === Breakdowns (Tableau de Synthèse) ===

@router.get("/breakdowns", response_model=List[PropertyBreakdownResponse])
async def get_breakdowns(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = get_project_or_404(db, project_id)
    if not can_read_project(db, current_user, project):
        raise HTTPException(status_code=403, detail="Accès refusé")

    breakdowns = db.query(PropertyBreakdown).filter(
        PropertyBreakdown.project_id == project_id
    ).order_by(PropertyBreakdown.order).all()
    return breakdowns


@router.post("/breakdowns", response_model=PropertyBreakdownResponse, status_code=status.HTTP_201_CREATED)
async def create_breakdown(
    project_id: int,
    data: PropertyBreakdownCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = get_project_or_404(db, project_id)
    if not can_write_project(db, current_user, project):
        raise HTTPException(status_code=403, detail="Accès refusé")

    breakdown = PropertyBreakdown(
        project_id=project_id,
        **data.model_dump()
    )
    db.add(breakdown)
    db.commit()
    db.refresh(breakdown)
    return breakdown


@router.put("/breakdowns/bulk", response_model=List[PropertyBreakdownResponse])
async def bulk_save_breakdowns(
    project_id: int,
    data: PropertyBreakdownBulk,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = get_project_or_404(db, project_id)
    if not can_write_project(db, current_user, project):
        raise HTTPException(status_code=403, detail="Accès refusé")

    # Supprimer les lignes existantes
    db.query(PropertyBreakdown).filter(
        PropertyBreakdown.project_id == project_id
    ).delete()

    # Recréer avec les nouvelles données
    breakdowns = []
    for i, item in enumerate(data.items):
        breakdown = PropertyBreakdown(
            project_id=project_id,
            local_type=item.local_type,
            surface=item.surface,
            price_per_m2=item.price_per_m2,
            rental_value_per_m2=item.rental_value_per_m2,
            venal_value_hd=item.venal_value_hd,
            rental_value_annual=item.rental_value_annual,
            rental_value_monthly=item.rental_value_monthly,
            is_venal_override=item.is_venal_override,
            is_rental_annual_override=item.is_rental_annual_override,
            is_rental_monthly_override=item.is_rental_monthly_override,
            order=item.order if item.order else i,
        )
        db.add(breakdown)
        breakdowns.append(breakdown)

    db.commit()
    for b in breakdowns:
        db.refresh(b)
    return breakdowns


@router.put("/breakdowns/{breakdown_id}", response_model=PropertyBreakdownResponse)
async def update_breakdown(
    project_id: int,
    breakdown_id: int,
    data: PropertyBreakdownUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = get_project_or_404(db, project_id)
    if not can_write_project(db, current_user, project):
        raise HTTPException(status_code=403, detail="Accès refusé")

    breakdown = db.query(PropertyBreakdown).filter(
        PropertyBreakdown.id == breakdown_id,
        PropertyBreakdown.project_id == project_id
    ).first()
    if not breakdown:
        raise HTTPException(status_code=404, detail="Ligne non trouvée")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(breakdown, key, value)

    db.commit()
    db.refresh(breakdown)
    return breakdown


@router.delete("/breakdowns/{breakdown_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_breakdown(
    project_id: int,
    breakdown_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = get_project_or_404(db, project_id)
    if not can_write_project(db, current_user, project):
        raise HTTPException(status_code=403, detail="Accès refusé")

    breakdown = db.query(PropertyBreakdown).filter(
        PropertyBreakdown.id == breakdown_id,
        PropertyBreakdown.project_id == project_id
    ).first()
    if not breakdown:
        raise HTTPException(status_code=404, detail="Ligne non trouvée")

    db.delete(breakdown)
    db.commit()


# === MarketEstimation ===

@router.get("/estimation", response_model=MarketEstimationResponse)
async def get_estimation(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = get_project_or_404(db, project_id)
    if not can_read_project(db, current_user, project):
        raise HTTPException(status_code=403, detail="Accès refusé")

    estimation = db.query(MarketEstimation).filter(
        MarketEstimation.project_id == project_id
    ).first()

    if not estimation:
        # Créer avec les valeurs par défaut
        estimation = MarketEstimation(project_id=project_id)
        db.add(estimation)
        db.commit()
        db.refresh(estimation)

    return estimation


@router.put("/estimation", response_model=MarketEstimationResponse)
async def save_estimation(
    project_id: int,
    data: MarketEstimationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = get_project_or_404(db, project_id)
    if not can_write_project(db, current_user, project):
        raise HTTPException(status_code=403, detail="Accès refusé")

    estimation = db.query(MarketEstimation).filter(
        MarketEstimation.project_id == project_id
    ).first()

    if not estimation:
        estimation = MarketEstimation(project_id=project_id)
        db.add(estimation)

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(estimation, key, value)

    db.commit()
    db.refresh(estimation)
    return estimation


# === Dev endpoints (sans auth) ===

@router.get("/dev/breakdowns", response_model=List[PropertyBreakdownResponse], tags=["Dev"])
async def dev_get_breakdowns(project_id: int, db: Session = Depends(get_db)):
    return db.query(PropertyBreakdown).filter(
        PropertyBreakdown.project_id == project_id
    ).order_by(PropertyBreakdown.order).all()


@router.post("/dev/breakdowns", response_model=PropertyBreakdownResponse, status_code=201, tags=["Dev"])
async def dev_create_breakdown(project_id: int, data: PropertyBreakdownCreate, db: Session = Depends(get_db)):
    breakdown = PropertyBreakdown(project_id=project_id, **data.model_dump())
    db.add(breakdown)
    db.commit()
    db.refresh(breakdown)
    return breakdown


@router.put("/dev/breakdowns/bulk", response_model=List[PropertyBreakdownResponse], tags=["Dev"])
async def dev_bulk_save_breakdowns(project_id: int, data: PropertyBreakdownBulk, db: Session = Depends(get_db)):
    db.query(PropertyBreakdown).filter(PropertyBreakdown.project_id == project_id).delete()
    breakdowns = []
    for i, item in enumerate(data.items):
        breakdown = PropertyBreakdown(
            project_id=project_id,
            local_type=item.local_type,
            surface=item.surface,
            price_per_m2=item.price_per_m2,
            rental_value_per_m2=item.rental_value_per_m2,
            venal_value_hd=item.venal_value_hd,
            rental_value_annual=item.rental_value_annual,
            rental_value_monthly=item.rental_value_monthly,
            is_venal_override=item.is_venal_override,
            is_rental_annual_override=item.is_rental_annual_override,
            is_rental_monthly_override=item.is_rental_monthly_override,
            order=item.order if item.order else i,
        )
        db.add(breakdown)
        breakdowns.append(breakdown)
    db.commit()
    for b in breakdowns:
        db.refresh(b)
    return breakdowns


@router.get("/dev/estimation", response_model=MarketEstimationResponse, tags=["Dev"])
async def dev_get_estimation(project_id: int, db: Session = Depends(get_db)):
    estimation = db.query(MarketEstimation).filter(MarketEstimation.project_id == project_id).first()
    if not estimation:
        estimation = MarketEstimation(project_id=project_id)
        db.add(estimation)
        db.commit()
        db.refresh(estimation)
    return estimation


@router.put("/dev/estimation", response_model=MarketEstimationResponse, tags=["Dev"])
async def dev_save_estimation(project_id: int, data: MarketEstimationUpdate, db: Session = Depends(get_db)):
    estimation = db.query(MarketEstimation).filter(MarketEstimation.project_id == project_id).first()
    if not estimation:
        estimation = MarketEstimation(project_id=project_id)
        db.add(estimation)
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(estimation, key, value)
    db.commit()
    db.refresh(estimation)
    return estimation
