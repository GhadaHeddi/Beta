"""
Modèle Document - Fichiers uploadés (plans, photos, diagnostics)
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum
from app.database import Base


class DocumentType(str, Enum):
    """Types de documents"""
    PHOTO = "photo"
    PLAN = "plan"
    DIAGNOSTIC = "diagnostic"
    CADASTRE = "cadastre"
    OTHER = "other"


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)

    name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)  # Chemin relatif dans le système de fichiers
    file_type = Column(SQLEnum(DocumentType), nullable=False)
    mime_type = Column(String, nullable=True)
    size = Column(Integer, nullable=True)  # Taille en octets
    description = Column(String, nullable=True)

    uploaded_at = Column(DateTime, default=datetime.utcnow)

    # Relations
    project = relationship("Project", back_populates="documents")

    def __repr__(self):
        return f"<Document(id={self.id}, name='{self.name}', type='{self.file_type}')>"
