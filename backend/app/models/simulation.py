"""
Modèle Simulation - Simulations financières
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum
from app.database import Base


class SimulationType(str, Enum):
    """Types de simulation"""
    RESERVE_FONCIERE = "reserve_fonciere"
    CAPACITE_EMPRUNT = "capacite_emprunt"
    EXTENSION = "extension"
    RENOVATION = "renovation"
    AUTRE = "autre"


class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)

    simulation_type = Column(
        SQLEnum(SimulationType, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
    )
    name = Column(String, nullable=False)  # Nom libre de la simulation
    input_data = Column(JSON, nullable=False)  # Données d'entrée
    output_data = Column(JSON, nullable=True)  # Résultats calculés
    notes = Column(String, nullable=True)
    selected = Column(Boolean, default=False, nullable=False)

    # Métadonnées
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    project = relationship("Project", back_populates="simulations")

    def __repr__(self):
        return f"<Simulation(id={self.id}, name='{self.name}', type='{self.simulation_type}')>"
