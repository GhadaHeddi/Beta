"""
Modèle GeographicZone - Zones géographiques prédéfinies par agence
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class GeographicZone(Base):
    __tablename__ = "geographic_zones"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    agency_id = Column(Integer, ForeignKey("agencies.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relations
    agency = relationship("Agency")

    def __repr__(self):
        return f"<GeographicZone(id={self.id}, name='{self.name}')>"
