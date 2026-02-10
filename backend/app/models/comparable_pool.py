"""
Modele ComparablePool - Pool de biens comparables de reference
Contient les biens issus de la base interne Arthur Loyd et des sources externes (DVF, concurrence)
"""
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Index, Enum as SQLEnum
from geoalchemy2 import Geometry
from datetime import datetime
from enum import Enum
from app.database import Base


class ComparableSource(str, Enum):
    """Sources des biens comparables"""
    ARTHUR_LOYD = "arthur_loyd"  # Base interne Arthur Loyd
    CONCURRENCE = "concurrence"  # DVF, SeLoger, autres sources


class TransactionType(str, Enum):
    """Types de transactions"""
    SALE = "sale"  # Vente
    RENT = "rent"  # Location


class ComparablePool(Base):
    __tablename__ = "comparable_pool"

    id = Column(Integer, primary_key=True, index=True)

    # Localisation
    address = Column(String, nullable=False)
    postal_code = Column(String, index=True, nullable=True)
    city = Column(String, index=True, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    # Colonne geographique pour les requetes spatiales PostGIS
    geom = Column(Geometry(geometry_type='POINT', srid=4326), nullable=True)

    # Caracteristiques du bien
    property_type = Column(String, index=True, nullable=False)  # office, warehouse, retail, industrial, land, mixed
    surface = Column(Float, nullable=False)  # Surface en m2
    construction_year = Column(Integer, nullable=True)

    # Donnees de transaction
    transaction_type = Column(SQLEnum(TransactionType, values_callable=lambda e: [x.value for x in e]), nullable=False)
    price = Column(Float, nullable=False)  # Prix total (vente) ou loyer annuel (location)
    price_per_m2 = Column(Float, nullable=False)  # Prix au m2

    transaction_date = Column(Date, nullable=False, index=True)

    # Source et reference
    source = Column(SQLEnum(ComparableSource, values_callable=lambda e: [x.value for x in e]), nullable=False, index=True)
    source_reference = Column(String, nullable=True)  # ID externe ou reference

    # Photo (optionnel)
    photo_url = Column(String, nullable=True)

    # Metadonnees
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<ComparablePool(id={self.id}, address='{self.address}', price={self.price_per_m2}EUR/m2, source='{self.source}')>"


# Index geographique pour optimiser les recherches spatiales
Index('idx_comparable_pool_geom', ComparablePool.geom, postgresql_using='gist')
Index('idx_comparable_pool_type', ComparablePool.property_type)
Index('idx_comparable_pool_date', ComparablePool.transaction_date)
Index('idx_comparable_pool_source', ComparablePool.source)
Index('idx_comparable_pool_type_source', ComparablePool.property_type, ComparablePool.source)
