"""
Schemas Pydantic pour l'API ORYEM
"""
from app.schemas.user import (
    UserBase,
    UserCreate,
    UserUpdate,
    UserResponse,
    LoginRequest,
    AuthResponse,
)

from app.schemas.project import (
    PropertyType,
    ProjectStatus,
    ProjectBase,
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectListResponse,
    PropertyInfoBase,
    PropertyInfoUpdate,
    PropertyInfoResponse,
)

__all__ = [
    # User schemas
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "LoginRequest",
    "AuthResponse",
    # Project schemas
    "PropertyType",
    "ProjectStatus",
    "ProjectBase",
    "ProjectCreate",
    "ProjectUpdate",
    "ProjectResponse",
    "ProjectListResponse",
    "PropertyInfoBase",
    "PropertyInfoUpdate",
    "PropertyInfoResponse",
]
