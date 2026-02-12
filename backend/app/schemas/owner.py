"""
Schemas Pydantic pour les propriétaires
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class OwnerCreate(BaseModel):
    name: str
    contact_name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None


class OwnerResponse(BaseModel):
    id: int
    name: str
    contact_name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    projects_count: int = 1

    class Config:
        from_attributes = True
