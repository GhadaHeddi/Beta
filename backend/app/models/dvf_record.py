"""
Modèle DVFRecord - Données des transactions immobilières (Demandes de Valeurs Foncières)
Source: https://app.dvf.etalab.gouv.fr/
"""
from sqlalchemy import Column, Integer, String, Float, Date, Index
from geoalchemy2 import Geography
from app.database import Base


class DVFRecord(Base):
    __tablename__ = "dvf_records"

    id = Column(Integer, primary_key=True, index=True)

    # Identifiants
    mutation_id = Column(String, index=True)  # ID de la mutation
    mutation_date = Column(Date, index=True, nullable=False)

    # Nature de la mutation
    nature_mutation = Column(String, nullable=True)  # Vente, Échange, etc.

    # Valeur
    valeur_fonciere = Column(Float, nullable=True)  # Prix de vente en €

    # Localisation
    adresse = Column(String, nullable=True)
    code_postal = Column(String, index=True, nullable=True)
    commune = Column(String, index=True, nullable=True)
    code_commune = Column(String, index=True, nullable=True)
    departement = Column(String, index=True, nullable=True)

    # Type de bien
    type_local = Column(String, index=True, nullable=True)  # Maison, Appartement, Local industriel, etc.

    # Surfaces
    surface_reelle_bati = Column(Float, nullable=True)  # Surface bâtie en m²
    surface_terrain = Column(Float, nullable=True)  # Surface du terrain en m²
    nombre_pieces_principales = Column(Integer, nullable=True)

    # Géolocalisation (PostGIS)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    # Colonne géographique pour les requêtes spatiales
    geom = Column(Geography(geometry_type='POINT', srid=4326), nullable=True)

    # Informations cadastrales
    code_type_local = Column(String, nullable=True)
    numero_disposition = Column(String, nullable=True)

    def __repr__(self):
        return f"<DVFRecord(id={self.id}, commune='{self.commune}', valeur={self.valeur_fonciere}€, date={self.mutation_date})>"


# Index géographique pour optimiser les recherches spatiales
Index('idx_dvf_geom', DVFRecord.geom, postgresql_using='gist')
Index('idx_dvf_date', DVFRecord.mutation_date)
Index('idx_dvf_type', DVFRecord.type_local)
Index('idx_dvf_commune', DVFRecord.commune)
