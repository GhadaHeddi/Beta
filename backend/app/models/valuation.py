"""
Modèle Valuation - Estimations de valeur par différentes méthodes
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum
from app.database import Base


class ValuationMethod(str, Enum):
    """Méthodes d'évaluation"""
    COMPARISON = "comparison"  # Méthode par comparaison
    INCOME_ESTIMATED = "income_estimated"  # Méthode par le revenu (loyer estimé)
    INCOME_ACTUAL = "income_actual"  # Méthode par le revenu (loyer constaté)
    COST = "cost"  # Méthode par le coût de reconstruction
    RESIDUAL = "residual"  # Méthode résiduelle (pour terrains)


class Valuation(Base):
    __tablename__ = "valuations"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)

    method = Column(SQLEnum(ValuationMethod), nullable=False)
    value = Column(Float, nullable=False)  # Valeur estimée en €
    weight = Column(Float, default=1.0)  # Pondération de la méthode (pour moyenne pondérée)

    # Paramètres spécifiques à chaque méthode (stocké en JSON)
    parameters = Column(JSON, nullable=True)
    # Exemples de paramètres :
    # - comparison: {"comparables_count": 5, "avg_price_per_m2": 2500}
    # - income_estimated: {"annual_rent": 97840, "yield_rate": 0.08, "mutation_rights": 0.074}
    # - income_actual: {"annual_rent": 105000, "yield_rate": 0.08, "mutation_rights": 0.074}

    # Notes et justifications
    notes = Column(String, nullable=True)

    # Métadonnées
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    project = relationship("Project", back_populates="valuations")

    def __repr__(self):
        return f"<Valuation(id={self.id}, method='{self.method}', value={self.value}€, weight={self.weight})>"
