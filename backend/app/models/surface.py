"""
Modèle Surface - Surfaces détaillées par niveau et type
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum
from app.database import Base


class SurfaceType(str, Enum):
    """Types de surface"""
    ATELIER = "atelier"
    BUREAUX = "bureaux"
    STOCKAGE = "stockage"
    COMMERCE = "commerce"
    ARCHIVES = "archives"
    EXTERIEUR = "exterieur"
    AUTRE = "autre"


class Surface(Base):
    __tablename__ = "project_surfaces"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)

    level = Column(String, nullable=False)  # Niveau (RDC, R+1, mezzanine...)
    surface_type = Column(SQLEnum(SurfaceType), nullable=False)
    area_sqm = Column(Float, nullable=False)  # Surface en m²
    rental_value_per_sqm = Column(Float, nullable=True)  # Valeur locative €/m²
    weighting = Column(Float, default=1.0)  # Coefficient de pondération
    notes = Column(String, nullable=True)

    # Métadonnées
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    project = relationship("Project", back_populates="surfaces")

    def __repr__(self):
        return f"<Surface(id={self.id}, level='{self.level}', type='{self.surface_type}', area={self.area_sqm}m²)>"
