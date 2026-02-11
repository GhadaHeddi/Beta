"""
Modèle AnalysisResult - Résultats d'analyse agrégés (one-to-one avec Project)
"""
from sqlalchemy import Column, Integer, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, unique=True)

    price_per_sqm_low = Column(Float, nullable=True)  # Fourchette basse €/m²
    price_per_sqm_high = Column(Float, nullable=True)  # Fourchette haute €/m²
    estimated_annual_rent = Column(Float, nullable=True)  # Loyer annuel estimé
    actual_annual_rent = Column(Float, nullable=True)  # Loyer annuel constaté
    value_low = Column(Float, nullable=True)  # Valeur basse €
    value_high = Column(Float, nullable=True)  # Valeur haute €
    weighted_average_value = Column(Float, nullable=True)  # Moyenne pondérée €
    retained_value = Column(Float, nullable=True)  # Valeur retenue finale €
    retained_yield_rate = Column(Float, nullable=True)  # Taux de rendement retenu
    notes = Column(Text, nullable=True)

    # Estimation de marché (ex-table market_estimations)
    sale_price_low = Column(Float, nullable=True)
    sale_price_high = Column(Float, nullable=True)
    sale_price_custom = Column(Float, nullable=True)
    sale_capitalization_rate = Column(Float, default=8.0)
    rent_low = Column(Float, nullable=True)
    rent_high = Column(Float, nullable=True)
    rent_custom = Column(Float, nullable=True)
    rent_capitalization_rate = Column(Float, default=8.0)

    # Métadonnées
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    project = relationship("Project", back_populates="analysis_result")

    def __repr__(self):
        return f"<AnalysisResult(id={self.id}, project_id={self.project_id}, retained_value={self.retained_value})>"
