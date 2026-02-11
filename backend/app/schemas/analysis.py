"""
Schémas Pydantic pour l'analyse (PropertyBreakdown et MarketEstimation)
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# === PropertyBreakdown ===

class PropertyBreakdownCreate(BaseModel):
    local_type: str
    surface: float
    price_per_m2: Optional[float] = None
    rental_value_per_m2: Optional[float] = None
    venal_value_hd: Optional[float] = None
    rental_value_annual: Optional[float] = None
    rental_value_monthly: Optional[float] = None
    is_venal_override: bool = False
    is_rental_annual_override: bool = False
    is_rental_monthly_override: bool = False
    order: int = 0


class PropertyBreakdownUpdate(BaseModel):
    local_type: Optional[str] = None
    surface: Optional[float] = None
    price_per_m2: Optional[float] = None
    rental_value_per_m2: Optional[float] = None
    venal_value_hd: Optional[float] = None
    rental_value_annual: Optional[float] = None
    rental_value_monthly: Optional[float] = None
    is_venal_override: Optional[bool] = None
    is_rental_annual_override: Optional[bool] = None
    is_rental_monthly_override: Optional[bool] = None
    order: Optional[int] = None


class PropertyBreakdownResponse(BaseModel):
    id: int
    project_id: int
    local_type: str
    surface: float
    price_per_m2: Optional[float] = None
    rental_value_per_m2: Optional[float] = None
    venal_value_hd: Optional[float] = None
    rental_value_annual: Optional[float] = None
    rental_value_monthly: Optional[float] = None
    is_venal_override: bool
    is_rental_annual_override: bool
    is_rental_monthly_override: bool
    order: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PropertyBreakdownBulkItem(BaseModel):
    id: Optional[int] = None
    local_type: str
    surface: float
    price_per_m2: Optional[float] = None
    rental_value_per_m2: Optional[float] = None
    venal_value_hd: Optional[float] = None
    rental_value_annual: Optional[float] = None
    rental_value_monthly: Optional[float] = None
    is_venal_override: bool = False
    is_rental_annual_override: bool = False
    is_rental_monthly_override: bool = False
    order: int = 0


class PropertyBreakdownBulk(BaseModel):
    items: List[PropertyBreakdownBulkItem]


# === MarketEstimation ===

class MarketEstimationUpdate(BaseModel):
    sale_price_low: Optional[float] = None
    sale_price_high: Optional[float] = None
    sale_price_custom: Optional[float] = None
    sale_capitalization_rate: Optional[float] = None
    rent_low: Optional[float] = None
    rent_high: Optional[float] = None
    rent_custom: Optional[float] = None
    rent_capitalization_rate: Optional[float] = None


class MarketEstimationResponse(BaseModel):
    id: int
    project_id: int
    sale_price_low: Optional[float] = None
    sale_price_high: Optional[float] = None
    sale_price_custom: Optional[float] = None
    sale_capitalization_rate: float
    rent_low: Optional[float] = None
    rent_high: Optional[float] = None
    rent_custom: Optional[float] = None
    rent_capitalization_rate: float
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
