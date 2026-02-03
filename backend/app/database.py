"""
Configuration de la base de données PostgreSQL
Connexion SQLAlchemy et gestion des sessions
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
from app.config import settings

# Création de l'engine SQLAlchemy
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,  # Active les logs SQL en mode debug
    pool_pre_ping=True,  # Vérifie la connexion avant chaque utilisation
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base pour les modèles
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    Générateur de session de base de données
    À utiliser comme dépendance FastAPI

    Usage:
        @app.get("/items")
        def read_items(db: Session = Depends(get_db)):
            return db.query(Item).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Initialise la base de données
    Crée toutes les tables définies dans les modèles
    Note: En production, utiliser Alembic pour les migrations
    """
    Base.metadata.create_all(bind=engine)
