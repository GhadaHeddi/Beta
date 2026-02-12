"""
Schémas Pydantic pour les simulations financières
"""
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class SimulationCreate(BaseModel):
    name: str
    simulation_type: str = "autre"
    input_data: Dict[str, Any]
    output_data: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    selected: bool = False


class SimulationUpdate(BaseModel):
    name: Optional[str] = None
    simulation_type: Optional[str] = None
    input_data: Optional[Dict[str, Any]] = None
    output_data: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    selected: Optional[bool] = None


class SimulationResponse(BaseModel):
    id: int
    project_id: int
    simulation_type: str
    name: str
    input_data: Dict[str, Any]
    output_data: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    selected: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
