"""
Modèle Comparable - Biens immobiliers comparables
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Comparable(Base):
    __tablename__ = "comparables"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)

    # Informations du bien comparable
    address = Column(String, nullable=False)
    postal_code = Column(String, nullable=True)
    city = Column(String, nullable=True)
    surface = Column(Float, nullable=False)  # Surface en m²
    price = Column(Float, nullable=False)  # Prix de vente
    price_per_m2 = Column(Float, nullable=False)  # Prix au m²

    # Distance par rapport au bien évalué
    distance = Column(Float, nullable=True)  # Distance en km
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Date de transaction
    transaction_date = Column(Date, nullable=True)

    # Ajustements
    adjustment = Column(Float, default=0.0)  # Décote (-) ou surcote (+) en pourcentage
    adjusted_price_per_m2 = Column(Float, nullable=True)  # Prix ajusté au m²

    # Validation
    validated = Column(Boolean, default=False)  # Comparable retenu ou non
    validation_notes = Column(String, nullable=True)

    # Source
    source = Column(String, nullable=True)  # DVF, SeLoger, etc.
    source_reference = Column(String, nullable=True)  # ID dans la source

    # Métadonnées
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    project = relationship("Project", back_populates="comparables")

    def __repr__(self):
        return f"<Comparable(id={self.id}, address='{self.address}', price={self.price}€, validated={self.validated})>"
