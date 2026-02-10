"""
Modèle DocumentGeneration - Génération de documents (PDF, PPTX, DOCX)
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum
from app.database import Base


class DocFormat(str, Enum):
    """Formats de document"""
    PDF = "pdf"
    PPTX = "pptx"
    DOCX = "docx"


class DocumentGeneration(Base):
    __tablename__ = "document_generations"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)

    doc_format = Column(SQLEnum(DocFormat), nullable=False)
    template_name = Column(String, nullable=True)  # Modèle utilisé
    retained_value = Column(Float, nullable=True)  # Valeur finale retenue pour ce doc
    retained_yield_rate = Column(Float, nullable=True)  # Rendement retenu
    included_sections = Column(JSON, nullable=True)  # Sections à inclure
    file_path = Column(String, nullable=True)  # Chemin du fichier généré
    generated_at = Column(DateTime, nullable=True)  # Date de génération effective

    # Métadonnées
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    project = relationship("Project", back_populates="document_generations")

    def __repr__(self):
        return f"<DocumentGeneration(id={self.id}, format='{self.doc_format}', file='{self.file_path}')>"
