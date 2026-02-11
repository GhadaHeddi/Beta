"""
Modèle MarketEstimation - Paramètres d'estimation de marché
"""
from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class MarketEstimation(Base):
    __tablename__ = "market_estimations"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, unique=True)

    # Bloc 2 - Estimation loyer depuis prix de vente
    sale_price_low = Column(Float, nullable=True)
    sale_price_high = Column(Float, nullable=True)
    sale_price_custom = Column(Float, nullable=True)
    sale_capitalization_rate = Column(Float, default=8.0)

    # Bloc 3 - Prix de vente depuis loyer constaté
    rent_low = Column(Float, nullable=True)
    rent_high = Column(Float, nullable=True)
    rent_custom = Column(Float, nullable=True)
    rent_capitalization_rate = Column(Float, default=8.0)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = relationship("Project", back_populates="market_estimation")
