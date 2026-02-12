"""
Modèle PropertyInfo - Informations détaillées du bien immobilier
"""
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class PropertyInfo(Base):
    __tablename__ = "property_infos"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, unique=True)

    # Informations propriétaire/occupant
    owner_name = Column(String, nullable=True)
    owner_contact = Column(String, nullable=True)
    occupant_name = Column(String, nullable=True)
    occupant_contact = Column(String, nullable=True)

    # Caractéristiques du bien
    property_state = Column(String, nullable=True)  # ancien, neuf, 2eme_main, recent
    construction_year = Column(Integer, nullable=True)
    materials = Column(String, nullable=True)
    total_surface = Column(Float, nullable=True)  # Surface totale en m²
    terrain_surface = Column(Float, nullable=True)  # Surface terrain en m²
    number_of_floors = Column(Integer, nullable=True)
    parking_spaces = Column(Integer, nullable=True)

    # Localisation géographique
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    postal_code = Column(String, nullable=True)
    city = Column(String, nullable=True)
    geographic_sector = Column(String, nullable=True)

    # Environnement PLU
    plu_zone = Column(String, nullable=True)
    plu_regulation = Column(Text, nullable=True)
    oap = Column(Text, nullable=True)  # Orientations d'Aménagement et de Programmation
    servitudes = Column(Text, nullable=True)
    flood_zones = Column(Text, nullable=True)

    # Analyse SWOT
    swot_strengths = Column(Text, nullable=True)  # Forces
    swot_weaknesses = Column(Text, nullable=True)  # Faiblesses
    swot_opportunities = Column(Text, nullable=True)  # Opportunités
    swot_threats = Column(Text, nullable=True)  # Menaces

    # Notes libres
    notes = Column(Text, nullable=True)

    # Métadonnées
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    project = relationship("Project", back_populates="property_info")

    def __repr__(self):
        return f"<PropertyInfo(id={self.id}, project_id={self.project_id}, surface={self.total_surface}m²)>"
