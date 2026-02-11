"""
Modèle Project - Projet d'avis de valeur
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum
from app.database import Base


class ProjectStatus(str, Enum):
    """Statuts possibles d'un projet"""
    DRAFT = "draft"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class PropertyType(str, Enum):
    """Types de biens immobiliers"""
    OFFICE = "office"  # Bureau
    WAREHOUSE = "warehouse"  # Entrepôt
    RETAIL = "retail"  # Commerce
    INDUSTRIAL = "industrial"  # Local d'activité
    LAND = "land"  # Terrain
    MIXED = "mixed"  # Mixte


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    address = Column(String, nullable=False)
    long_address = Column(String, nullable=True)
    property_type = Column(SQLEnum(PropertyType), nullable=False)
    status = Column(SQLEnum(ProjectStatus), default=ProjectStatus.DRAFT)
    current_step = Column(Integer, default=1)  # Étape actuelle (1-5)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True, default=None)  # Soft delete - corbeille

    # Relations
    user = relationship("User", back_populates="projects")
    property_info = relationship("PropertyInfo", back_populates="project", uselist=False, cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="project", cascade="all, delete-orphan")
    comparables = relationship("Comparable", back_populates="project", cascade="all, delete-orphan")
    valuations = relationship("Valuation", back_populates="project", cascade="all, delete-orphan")
    shares = relationship("ProjectShare", back_populates="project", cascade="all, delete-orphan")
    surfaces = relationship("Surface", back_populates="project", cascade="all, delete-orphan")
    analysis_result = relationship("AnalysisResult", back_populates="project", uselist=False, cascade="all, delete-orphan")
    simulations = relationship("Simulation", back_populates="project", cascade="all, delete-orphan")
    document_generations = relationship("DocumentGeneration", back_populates="project", cascade="all, delete-orphan")
    breakdowns = relationship("PropertyBreakdown", back_populates="project", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Project(id={self.id}, title='{self.title}', status='{self.status}')>"
