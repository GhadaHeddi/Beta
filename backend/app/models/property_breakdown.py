"""
Modèle PropertyBreakdown - Décomposition par type de local
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class PropertyBreakdown(Base):
    __tablename__ = "property_breakdowns"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)

    local_type = Column(String, nullable=False)  # "Bureaux", "Commerce", "Entrepôt", etc.
    surface = Column(Float, nullable=False)
    price_per_m2 = Column(Float, nullable=True)
    rental_value_per_m2 = Column(Float, nullable=True)
    venal_value_hd = Column(Float, nullable=True)
    rental_value_annual = Column(Float, nullable=True)
    rental_value_monthly = Column(Float, nullable=True)

    is_venal_override = Column(Boolean, default=False)
    is_rental_annual_override = Column(Boolean, default=False)
    is_rental_monthly_override = Column(Boolean, default=False)

    order = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = relationship("Project", back_populates="breakdowns")
