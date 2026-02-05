"""
Routers API de l'application ORYEM
"""
from app.routers.auth import router as auth_router
from app.routers.admin import router as admin_router
from app.routers.projects import router as projects_router

__all__ = [
    "auth_router",
    "admin_router",
    "projects_router",
]
