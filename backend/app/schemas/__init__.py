"""
Schémas Pydantic de l'application ORYEM
"""
from app.schemas.user import (
    UserBase,
    ConsultantCreate,
    UserUpdate,
    UserResponse,
    UserBrief,
    Token,
    TokenData,
    LoginRequest,
    ChangePasswordRequest,
)
from app.schemas.analysis import (
    PropertyBreakdownCreate,
    PropertyBreakdownUpdate,
    PropertyBreakdownResponse,
    PropertyBreakdownBulk,
    PropertyBreakdownBulkItem,
    MarketEstimationUpdate,
    MarketEstimationResponse,
)
from app.schemas.project import (
    ProjectBase,
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectWithOwner,
    ProjectList,
    ProjectShareCreate,
    ProjectShareResponse,
)

__all__ = [
    # User schemas
    "UserBase",
    "ConsultantCreate",
    "UserUpdate",
    "UserResponse",
    "UserBrief",
    "Token",
    "TokenData",
    "LoginRequest",
    "ChangePasswordRequest",
    # Project schemas
    "ProjectBase",
    "ProjectCreate",
    "ProjectUpdate",
    "ProjectResponse",
    "ProjectWithOwner",
    "ProjectList",
    "ProjectShareCreate",
    "ProjectShareResponse",
    # Analysis schemas
    "PropertyBreakdownCreate",
    "PropertyBreakdownUpdate",
    "PropertyBreakdownResponse",
    "PropertyBreakdownBulk",
    "PropertyBreakdownBulkItem",
    "MarketEstimationUpdate",
    "MarketEstimationResponse",
]
