"""
Routes pour les simulations financières d'un projet
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.utils.security import get_current_user
from app.models import User, Project, Simulation
from app.models.simulation import SimulationType
from app.schemas.simulation import SimulationCreate, SimulationUpdate, SimulationResponse
from app.routers.projects import can_read_project, can_write_project


router = APIRouter(prefix="/projects/{project_id}/simulations", tags=["Simulations"])


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


def resolve_simulation_type(value: str) -> SimulationType:
    """Convert a string to SimulationType enum (by value)."""
    try:
        return SimulationType(value)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Type de simulation invalide: {value}"
        )


def get_simulation_or_404(db: Session, project_id: int, simulation_id: int) -> Simulation:
    simulation = db.query(Simulation).filter(
        Simulation.id == simulation_id,
        Simulation.project_id == project_id
    ).first()
    if not simulation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Simulation non trouvée"
        )
    return simulation


# === Endpoints authentifiés ===

@router.get("/", response_model=List[SimulationResponse])
async def get_simulations(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = get_project_or_404(db, project_id)
    if not can_read_project(db, current_user, project):
        raise HTTPException(status_code=403, detail="Accès refusé")

    return db.query(Simulation).filter(
        Simulation.project_id == project_id
    ).order_by(Simulation.created_at).all()


@router.post("/", response_model=SimulationResponse, status_code=status.HTTP_201_CREATED)
async def create_simulation(
    project_id: int,
    data: SimulationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = get_project_or_404(db, project_id)
    if not can_write_project(db, current_user, project):
        raise HTTPException(status_code=403, detail="Accès refusé")

    sim_data = data.model_dump()
    sim_data["simulation_type"] = resolve_simulation_type(sim_data["simulation_type"])
    simulation = Simulation(project_id=project_id, **sim_data)
    db.add(simulation)
    db.commit()
    db.refresh(simulation)
    return simulation


@router.get("/{simulation_id}", response_model=SimulationResponse)
async def get_simulation(
    project_id: int,
    simulation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = get_project_or_404(db, project_id)
    if not can_read_project(db, current_user, project):
        raise HTTPException(status_code=403, detail="Accès refusé")

    return get_simulation_or_404(db, project_id, simulation_id)


@router.put("/{simulation_id}", response_model=SimulationResponse)
async def update_simulation(
    project_id: int,
    simulation_id: int,
    data: SimulationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = get_project_or_404(db, project_id)
    if not can_write_project(db, current_user, project):
        raise HTTPException(status_code=403, detail="Accès refusé")

    simulation = get_simulation_or_404(db, project_id, simulation_id)

    update_data = data.model_dump(exclude_unset=True)
    if "simulation_type" in update_data:
        update_data["simulation_type"] = resolve_simulation_type(update_data["simulation_type"])
    for key, value in update_data.items():
        setattr(simulation, key, value)

    db.commit()
    db.refresh(simulation)
    return simulation


@router.delete("/{simulation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_simulation(
    project_id: int,
    simulation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = get_project_or_404(db, project_id)
    if not can_write_project(db, current_user, project):
        raise HTTPException(status_code=403, detail="Accès refusé")

    simulation = get_simulation_or_404(db, project_id, simulation_id)
    db.delete(simulation)
    db.commit()


# === Dev endpoints (sans auth) ===

@router.get("/dev/", response_model=List[SimulationResponse], tags=["Dev"])
async def dev_get_simulations(project_id: int, db: Session = Depends(get_db)):
    return db.query(Simulation).filter(
        Simulation.project_id == project_id
    ).order_by(Simulation.created_at).all()


@router.post("/dev/", response_model=SimulationResponse, status_code=201, tags=["Dev"])
async def dev_create_simulation(project_id: int, data: SimulationCreate, db: Session = Depends(get_db)):
    sim_data = data.model_dump()
    sim_data["simulation_type"] = resolve_simulation_type(sim_data["simulation_type"])
    simulation = Simulation(project_id=project_id, **sim_data)
    db.add(simulation)
    db.commit()
    db.refresh(simulation)
    return simulation


@router.get("/dev/{simulation_id}", response_model=SimulationResponse, tags=["Dev"])
async def dev_get_simulation(project_id: int, simulation_id: int, db: Session = Depends(get_db)):
    return get_simulation_or_404(db, project_id, simulation_id)


@router.put("/dev/{simulation_id}", response_model=SimulationResponse, tags=["Dev"])
async def dev_update_simulation(
    project_id: int,
    simulation_id: int,
    data: SimulationUpdate,
    db: Session = Depends(get_db)
):
    simulation = get_simulation_or_404(db, project_id, simulation_id)
    update_data = data.model_dump(exclude_unset=True)
    if "simulation_type" in update_data:
        update_data["simulation_type"] = resolve_simulation_type(update_data["simulation_type"])
    for key, value in update_data.items():
        setattr(simulation, key, value)
    db.commit()
    db.refresh(simulation)
    return simulation


@router.delete("/dev/{simulation_id}", status_code=204, tags=["Dev"])
async def dev_delete_simulation(project_id: int, simulation_id: int, db: Session = Depends(get_db)):
    simulation = get_simulation_or_404(db, project_id, simulation_id)
    db.delete(simulation)
    db.commit()
