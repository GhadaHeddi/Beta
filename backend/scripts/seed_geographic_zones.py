#!/usr/bin/env python3
"""
Script pour peupler les zones géographiques de Valence et Avignon.
Usage: python -m scripts.seed_geographic_zones
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import Agency
from app.models.geographic_zone import GeographicZone


# Zones géographiques pour Valence (Drôme, 26)
ZONES_VALENCE = [
    "Centre-ville Valence",
    "Quartier Victor Hugo",
    "Quartier de la Gare - Valence",
    "Briffaut",
    "Zone industrielle Briffaut",
    "Fontbarlettes",
    "Châteauvert",
    "Le Plan",
    "Lautagne",
    "Les Baumes-les Balmes",
    "Épervière",
    "Quartier de la Chamberlière",
    "Parc Jean Perdrix",
    "Zone Laye-Alixan-Rovaltain",
    "Rovaltain TGV",
    "Bourg-lès-Valence",
    "Portes-lès-Valence",
    "Guilherand-Granges",
    "Saint-Péray",
    "Tain-l'Hermitage - Tournon",
    "Romans-sur-Isère Centre",
    "Romans-sur-Isère Zone industrielle",
    "Zone d'activités Belle Étoile",
    "Crest",
    "Montélimar Centre",
    "Montélimar Zone d'activités",
    "Zone LATOUR-MAUBOURG",
    "Valence Sud - Fiancey",
    "Beaumont-lès-Valence",
    "Chabeuil",
]

# Zones géographiques pour Avignon (Vaucluse, 84)
ZONES_AVIGNON = [
    "Intra-muros - Centre historique",
    "Courtine",
    "Zone d'activités de Courtine",
    "Agroparc",
    "Zone industrielle de Fontcouverte",
    "Quartier Saint-Ruf",
    "Montfavet",
    "Les Angles",
    "Villeneuve-lès-Avignon",
    "Le Pontet",
    "Le Pontet - Zone commerciale Avignon Nord",
    "Zone commerciale Cap Sud",
    "Quartier Saint-Chamand",
    "Quartier Saint-Jean",
    "Rocade Sud - MIN",
    "Vedène",
    "Sorgues",
    "Entraigues-sur-la-Sorgue",
    "L'Isle-sur-la-Sorgue",
    "Carpentras Centre",
    "Carpentras Zone d'activités",
    "Cavaillon Centre",
    "Cavaillon Zone d'activités",
    "Orange Centre",
    "Orange Zone d'activités",
    "Pertuis",
    "Apt",
    "Bollène",
    "Zone TGV Avignon",
    "Châteaurenard",
]


def seed_zones(db):
    """Insère les zones géographiques pour Valence et Avignon."""

    # Trouver les agences
    valence = db.query(Agency).filter(Agency.city == "Valence").first()
    avignon = db.query(Agency).filter(Agency.city == "Avignon").first()

    if not valence or not avignon:
        print("Erreur : les agences Valence et/ou Avignon n'existent pas en base.")
        print("Lancez d'abord le seed des agences.")
        sys.exit(1)

    # Vérifier si des zones existent déjà
    existing_count = db.query(GeographicZone).count()
    if existing_count > 0:
        print(f"  {existing_count} zones existent deja. Suppression...")
        db.query(GeographicZone).delete()
        db.commit()

    count = 0

    # Zones Valence
    for zone_name in ZONES_VALENCE:
        zone = GeographicZone(name=zone_name, agency_id=valence.id)
        db.add(zone)
        count += 1

    # Zones Avignon
    for zone_name in ZONES_AVIGNON:
        zone = GeographicZone(name=zone_name, agency_id=avignon.id)
        db.add(zone)
        count += 1

    db.commit()
    print(f"  {count} zones geographiques inserees")
    print(f"    - Valence (agence #{valence.id}) : {len(ZONES_VALENCE)} zones")
    print(f"    - Avignon (agence #{avignon.id}) : {len(ZONES_AVIGNON)} zones")


def main():
    print("Seed des zones geographiques Valence & Avignon...")
    print("-" * 50)

    db = SessionLocal()
    try:
        seed_zones(db)
    except Exception as e:
        print(f"Erreur : {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

    print("-" * 50)
    print("Seed termine !")


if __name__ == "__main__":
    main()
