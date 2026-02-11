#!/usr/bin/env python3
"""
Script pour peupler la table comparable_pool avec des donnees de test.
Cree des biens comparables autour de Paris pour tester la recherche spatiale.
Usage: python scripts/seed_comparable_pool.py
"""
import sys
import os
from datetime import date, timedelta
import random

# Ajouter le repertoire parent au path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import SessionLocal
from app.models import ComparablePool, ComparableSource, TransactionType


def create_comparable_pool_data(db: Session) -> list:
    """Cree des biens comparables de test autour de Paris."""

    # Coordonnees de base pour differents secteurs de Paris/Ile-de-France
    locations = [
        # Paris Centre
        {"lat": 48.8566, "lng": 2.3522, "city": "Paris", "postal_code": "75001", "sector": "centre"},
        {"lat": 48.8606, "lng": 2.3376, "city": "Paris", "postal_code": "75001", "sector": "centre"},
        {"lat": 48.8534, "lng": 2.3488, "city": "Paris", "postal_code": "75004", "sector": "centre"},
        # La Defense
        {"lat": 48.8920, "lng": 2.2362, "city": "Courbevoie", "postal_code": "92400", "sector": "defense"},
        {"lat": 48.8892, "lng": 2.2420, "city": "Puteaux", "postal_code": "92800", "sector": "defense"},
        {"lat": 48.8950, "lng": 2.2300, "city": "Courbevoie", "postal_code": "92400", "sector": "defense"},
        # Neuilly-sur-Seine
        {"lat": 48.8848, "lng": 2.2686, "city": "Neuilly-sur-Seine", "postal_code": "92200", "sector": "neuilly"},
        {"lat": 48.8810, "lng": 2.2750, "city": "Neuilly-sur-Seine", "postal_code": "92200", "sector": "neuilly"},
        # Boulogne-Billancourt
        {"lat": 48.8352, "lng": 2.2410, "city": "Boulogne-Billancourt", "postal_code": "92100", "sector": "boulogne"},
        {"lat": 48.8400, "lng": 2.2350, "city": "Boulogne-Billancourt", "postal_code": "92100", "sector": "boulogne"},
        # Saint-Denis (entrepots)
        {"lat": 48.9362, "lng": 2.3574, "city": "Saint-Denis", "postal_code": "93200", "sector": "saintdenis"},
        {"lat": 48.9300, "lng": 2.3600, "city": "Saint-Denis", "postal_code": "93200", "sector": "saintdenis"},
        # Gennevilliers (industriel)
        {"lat": 48.9276, "lng": 2.2902, "city": "Gennevilliers", "postal_code": "92230", "sector": "gennevilliers"},
        {"lat": 48.9300, "lng": 2.2850, "city": "Gennevilliers", "postal_code": "92230", "sector": "gennevilliers"},
        # Roissy (logistique)
        {"lat": 49.0097, "lng": 2.5479, "city": "Roissy-en-France", "postal_code": "95700", "sector": "roissy"},
        {"lat": 49.0050, "lng": 2.5400, "city": "Roissy-en-France", "postal_code": "95700", "sector": "roissy"},
    ]

    # Types de biens avec caracteristiques typiques
    property_configs = {
        "office": {
            "surfaces": [150, 280, 450, 600, 850, 1200, 2500],
            "years": [1985, 1995, 2005, 2010, 2015, 2018, 2022],
            "sale_prices_m2": [3500, 4000, 4500, 5000, 5500, 6000, 7000],
            "rent_prices_m2": [250, 300, 350, 400, 450, 500, 600],
            "addresses_prefix": ["Tour", "Immeuble", "Centre d'affaires", "Building"],
        },
        "warehouse": {
            "surfaces": [500, 1000, 2000, 3500, 5000, 8000, 15000],
            "years": [1975, 1985, 1995, 2005, 2010, 2015, 2020],
            "sale_prices_m2": [800, 1000, 1200, 1500, 1800, 2000, 2500],
            "rent_prices_m2": [50, 70, 90, 110, 130, 150, 180],
            "addresses_prefix": ["Entrepot", "Batiment logistique", "Plateforme", "Hub"],
        },
        "retail": {
            "surfaces": [80, 150, 250, 400, 600, 1000, 2000],
            "years": [1970, 1985, 1995, 2000, 2010, 2015, 2020],
            "sale_prices_m2": [4000, 5000, 6000, 7500, 9000, 11000, 15000],
            "rent_prices_m2": [400, 500, 600, 750, 900, 1100, 1500],
            "addresses_prefix": ["Boutique", "Local commercial", "Magasin", "Galerie"],
        },
        "industrial": {
            "surfaces": [300, 600, 1000, 1500, 2500, 4000, 6000],
            "years": [1965, 1980, 1990, 2000, 2008, 2015, 2020],
            "sale_prices_m2": [600, 800, 1000, 1300, 1600, 2000, 2500],
            "rent_prices_m2": [40, 55, 70, 90, 110, 140, 180],
            "addresses_prefix": ["Atelier", "Local d'activite", "Batiment industriel", "Unite"],
        },
        "land": {
            "surfaces": [500, 1000, 2000, 5000, 10000, 20000, 50000],
            "years": [None, None, None, None, None, None, None],
            "sale_prices_m2": [200, 350, 500, 700, 1000, 1500, 2500],
            "rent_prices_m2": [15, 25, 40, 60, 80, 100, 150],
            "addresses_prefix": ["Terrain", "Parcelle", "Foncier", "Lot"],
        },
    }

    comparables = []
    base_date = date.today()

    for i, loc in enumerate(locations):
        # Determiner le type de bien selon le secteur
        if loc["sector"] in ["centre", "defense", "neuilly"]:
            property_types = ["office", "retail"]
        elif loc["sector"] in ["saintdenis", "gennevilliers"]:
            property_types = ["warehouse", "industrial"]
        elif loc["sector"] == "roissy":
            property_types = ["warehouse", "land"]
        else:
            property_types = ["office", "retail"]

        # Creer 3-5 biens par localisation
        for j in range(random.randint(3, 5)):
            property_type = random.choice(property_types)
            config = property_configs[property_type]

            # Ajouter un leger decalage aux coordonnees
            lat_offset = random.uniform(-0.005, 0.005)
            lng_offset = random.uniform(-0.005, 0.005)

            # Choisir des valeurs aleatoires
            surface = random.choice(config["surfaces"])
            year = random.choice(config["years"])

            # Alterner entre vente et location
            if random.random() < 0.6:  # 60% ventes
                transaction_type = TransactionType.SALE
                price_m2 = random.choice(config["sale_prices_m2"])
                # Ajouter une variation de +/- 15%
                price_m2 = price_m2 * random.uniform(0.85, 1.15)
            else:
                transaction_type = TransactionType.RENT
                price_m2 = random.choice(config["rent_prices_m2"])
                price_m2 = price_m2 * random.uniform(0.85, 1.15)

            price_m2 = round(price_m2, 2)
            total_price = round(surface * price_m2, 2)

            # Date de transaction aleatoire dans les 2 dernieres annees
            days_ago = random.randint(30, 730)
            transaction_date = base_date - timedelta(days=days_ago)

            # Source aleatoire (60% Arthur Loyd, 40% Concurrence)
            source = ComparableSource.ARTHUR_LOYD if random.random() < 0.6 else ComparableSource.CONCURRENCE

            # Generer l'adresse
            prefix = random.choice(config["addresses_prefix"])
            street_num = random.randint(1, 150)
            streets = ["Rue de la Paix", "Avenue des Champs", "Boulevard Haussmann",
                      "Rue du Commerce", "Avenue de la Grande Armee", "Rue de Rivoli",
                      "Boulevard de la Liberation", "Rue Jean Jaures", "Avenue Victor Hugo"]
            street = random.choice(streets)
            address = f"{prefix} - {street_num} {street}, {loc['postal_code']} {loc['city']}"

            comparable = ComparablePool(
                address=address,
                postal_code=loc["postal_code"],
                city=loc["city"],
                latitude=loc["lat"] + lat_offset,
                longitude=loc["lng"] + lng_offset,
                property_type=property_type,
                surface=surface,
                construction_year=year,
                transaction_type=transaction_type,
                price=total_price,
                price_per_m2=price_m2,
                transaction_date=transaction_date,
                source=source,
                source_reference=f"REF-{property_type.upper()[:3]}-{i:03d}-{j:02d}",
                photo_url=None
            )

            comparables.append(comparable)

    return comparables


def update_geom_column(db: Session):
    """Met a jour la colonne geom avec les coordonnees lat/lng."""
    db.execute(text("""
        UPDATE comparable_pool
        SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    """))
    db.commit()


def main():
    print("=" * 60)
    print("Peuplement de la table comparable_pool")
    print("=" * 60)

    db = SessionLocal()
    try:
        # Verifier si des donnees existent deja
        existing_count = db.query(ComparablePool).count()
        if existing_count > 0:
            print(f"\n{existing_count} comparables existent deja dans la base.")
            db.query(ComparablePool).delete()
            db.commit()
        # Creer les donnees
        print("\nCreation des biens comparables...")
        comparables = create_comparable_pool_data(db)

        # Ajouter en base
        for comp in comparables:
            db.add(comp)

        db.commit()
        print(f"   {len(comparables)} comparables crees")

        # Mettre a jour la colonne geom
        print("\nMise a jour des colonnes PostGIS...")
        update_geom_column(db)
        print("   Colonnes geom mises a jour")

        # Statistiques
        print("\n" + "=" * 60)
        print("STATISTIQUES")
        print("=" * 60)

        for ptype in ["office", "warehouse", "retail", "industrial", "land"]:
            count = db.query(ComparablePool).filter(
                ComparablePool.property_type == ptype
            ).count()
            print(f"  {ptype}: {count} biens")

        arthur_loyd_count = db.query(ComparablePool).filter(
            ComparablePool.source == ComparableSource.ARTHUR_LOYD
        ).count()
        concurrence_count = db.query(ComparablePool).filter(
            ComparablePool.source == ComparableSource.CONCURRENCE
        ).count()

        print(f"\n  Source Arthur Loyd: {arthur_loyd_count}")
        print(f"  Source Concurrence: {concurrence_count}")

        sale_count = db.query(ComparablePool).filter(
            ComparablePool.transaction_type == TransactionType.SALE
        ).count()
        rent_count = db.query(ComparablePool).filter(
            ComparablePool.transaction_type == TransactionType.RENT
        ).count()

        print(f"\n  Ventes: {sale_count}")
        print(f"  Locations: {rent_count}")

    except Exception as e:
        print(f"\nErreur: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

    print("\n" + "=" * 60)
    print("Seed comparable_pool termine avec succes!")
    print("=" * 60)


if __name__ == "__main__":
    main()
