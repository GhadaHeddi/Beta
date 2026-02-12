"""
ORYEM Backend - FastAPI Application
Point d'entrée principal de l'API
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base

# Import des routeurs
from app.routers.auth import router as auth_router
from app.routers.admin import router as admin_router
from app.routers.projects import router as projects_router
from app.routers.comparables import router as comparables_router
from app.routers.analysis import router as analysis_router
from app.routers.owners import router as owners_router
from app.routers.agencies import router as agencies_router
from app.routers.geographic_zones import router as geographic_zone_router

app = FastAPI(
    title="ORYEM API",
    description="API pour la gestion des avis de valeur immobiliers - Arthur Loyd",
    version="0.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Événement de démarrage de l'application"""
    print("🚀 Démarrage de l'application ORYEM...")
    # Création des tables (à remplacer par Alembic en production)
    # Base.metadata.create_all(bind=engine)
    print("✅ Application prête")


@app.on_event("shutdown")
async def shutdown_event():
    """Événement d'arrêt de l'application"""
    print("🛑 Arrêt de l'application ORYEM...")


@app.get("/", tags=["Health"])
async def root():
    """Route racine - Health check"""
    return {
        "status": "ok",
        "message": "ORYEM API is running",
        "version": "0.1.0"
    }


@app.get("/api/health", tags=["Health"])
async def health_check():
    """Endpoint de santé de l'API"""
    return {
        "status": "healthy",
        "database": "connected"  # TODO: Vérifier la connexion réelle
    }


# Enregistrement des routeurs
app.include_router(auth_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(projects_router, prefix="/api")
app.include_router(comparables_router, prefix="/api")
app.include_router(analysis_router, prefix="/api")
app.include_router(owners_router, prefix="/api")
app.include_router(agencies_router, prefix="/api")
app.include_router(geographic_zone_router, prefix="/api")



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
