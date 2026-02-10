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
    # Project schemas
    "ProjectBase",
    "ProjectCreate",
    "ProjectUpdate",
    "ProjectResponse",
    "ProjectWithOwner",
    "ProjectList",
    "ProjectShareCreate",
    "ProjectShareResponse",
]
