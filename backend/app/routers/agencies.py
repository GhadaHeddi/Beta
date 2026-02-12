"""
Routes des agences - CRUD et gestion des associations utilisateur/agence
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.agency import (
    AgencyCreate,
    AgencyUpdate,
    AgencyResponse,
    AgencyWithStats,
    UserAgencyAdd,
)
from app.services.agency import (
    create_agency,
    get_agency_by_id,
    get_all_agencies,
    get_agencies_for_user,
    add_user_to_agency,
    remove_user_from_agency,
    get_agency_stats,
)
from app.utils.security import get_current_user, require_admin
from app.models import User
from app.services.user import get_user_by_id

router = APIRouter(prefix="/agencies", tags=["Agences"])


@router.get("/", response_model=List[AgencyResponse])
async def list_agencies(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Liste toutes les agences (admin uniquement)."""
    return get_all_agencies(db)


@router.get("/mine", response_model=List[AgencyResponse])
async def list_my_agencies(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Liste les agences de l'utilisateur connecte."""
    return get_agencies_for_user(db, user_id=current_user.id)


@router.post("/", response_model=AgencyResponse, status_code=status.HTTP_201_CREATED)
async def create_new_agency(
    agency_data: AgencyCreate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Cree une nouvelle agence et associe automatiquement l'admin."""
    agency = create_agency(
        db,
        name=agency_data.name,
        address=agency_data.address,
        city=agency_data.city,
        postal_code=agency_data.postal_code,
        phone=agency_data.phone,
        email=agency_data.email,
    )
    # Auto-associer l'admin a l'agence
    add_user_to_agency(db, user_id=admin.id, agency_id=agency.id, is_primary=False)
    return agency


@router.get("/{agency_id}", response_model=AgencyWithStats)
async def get_agency(
    agency_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Recupere les details d'une agence avec ses statistiques."""
    agency = get_agency_by_id(db, agency_id)
    if not agency:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agence non trouvee",
        )

    stats = get_agency_stats(db, agency_id)
    return AgencyWithStats(
        id=agency.id,
        name=agency.name,
        address=agency.address,
        city=agency.city,
        postal_code=agency.postal_code,
        phone=agency.phone,
        email=agency.email,
        created_at=agency.created_at,
        updated_at=agency.updated_at,
        **stats,
    )


@router.put("/{agency_id}", response_model=AgencyResponse)
async def update_agency(
    agency_id: int,
    agency_data: AgencyUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Modifie une agence (admin uniquement)."""
    agency = get_agency_by_id(db, agency_id)
    if not agency:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agence non trouvee",
        )

    update_data = agency_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(agency, field, value)

    db.commit()
    db.refresh(agency)
    return agency


@router.delete("/{agency_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agency(
    agency_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Supprime une agence (admin uniquement)."""
    agency = get_agency_by_id(db, agency_id)
    if not agency:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agence non trouvee",
        )

    db.delete(agency)
    db.commit()


@router.post("/{agency_id}/users", status_code=status.HTTP_201_CREATED)
async def add_user_to_agency_route(
    agency_id: int,
    data: UserAgencyAdd,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Rattache un utilisateur a une agence (admin uniquement)."""
    agency = get_agency_by_id(db, agency_id)
    if not agency:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agence non trouvee",
        )

    user = get_user_by_id(db, data.user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouve",
        )

    user_agency = add_user_to_agency(
        db, user_id=data.user_id, agency_id=agency_id, is_primary=data.is_primary
    )
    return {
        "user_id": user_agency.user_id,
        "agency_id": user_agency.agency_id,
        "is_primary": user_agency.is_primary,
    }


@router.delete("/{agency_id}/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_user_from_agency_route(
    agency_id: int,
    user_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Detache un utilisateur d'une agence (admin uniquement)."""
    removed = remove_user_from_agency(db, user_id=user_id, agency_id=agency_id)
    if not removed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Association non trouvee",
        )
