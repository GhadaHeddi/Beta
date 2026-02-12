"""
Routes des propriétaires - CRUD sans authentification (dev)
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.database import get_db
from app.models.owner import Owner
from app.schemas.owner import OwnerCreate, OwnerResponse

router = APIRouter(prefix="/owners", tags=["Propriétaires"])


@router.get("/dev/search", response_model=List[OwnerResponse])
def search_owners(
    name: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
):
    """
    Recherche un propriétaire par nom (insensible à la casse).
    Retourne les propriétaires dont le nom correspond exactement (trim + lower).
    """
    clean_name = name.strip().lower()
    owners = (
        db.query(Owner)
        .filter(func.lower(func.trim(Owner.name)) == clean_name)
        .all()
    )
    return owners


@router.post("/dev/", response_model=OwnerResponse)
def create_owner(
    data: OwnerCreate,
    db: Session = Depends(get_db),
):
    """
    Crée un nouveau propriétaire ou met à jour s'il existe déjà (insensible à la casse).
    """
    clean_name = data.name.strip().lower()

    existing = (
        db.query(Owner)
        .filter(func.lower(func.trim(Owner.name)) == clean_name)
        .first()
    )

    if existing:
        if data.contact_name is not None:
            existing.contact_name = data.contact_name
        if data.address is not None:
            existing.address = data.address
        if data.phone is not None:
            existing.phone = data.phone
        if data.email is not None:
            existing.email = data.email
        existing.projects_count = existing.projects_count + 1
        db.commit()
        db.refresh(existing)
        return existing

    owner = Owner(
        name=data.name.strip(),
        contact_name=data.contact_name,
        address=data.address,
        phone=data.phone,
        email=data.email,
        projects_count=1,
    )
    db.add(owner)
    db.commit()
    db.refresh(owner)
    return owner
