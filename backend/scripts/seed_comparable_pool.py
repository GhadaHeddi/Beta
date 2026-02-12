#!/usr/bin/env python3
"""
Script pour peupler la table comparable_pool avec des donnees de test.
Cree des biens comparables autour de Valence (Drome) et Avignon (Vaucluse)
pour tester la recherche spatiale.
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
    """Cree des biens comparables de test autour de Valence et Avignon."""

    # Coordonnees de base pour differents secteurs
    locations = [
        # =========================
        # VALENCE (DROME)
        # =========================
        # Valence Centre-ville (bureaux, commerces)
        {"lat": 44.9334, "lng": 4.8924, "city": "Valence", "postal_code": "26000", "sector": "valence_centre"},
        {"lat": 44.9315, "lng": 4.8890, "city": "Valence", "postal_code": "26000", "sector": "valence_centre"},
        {"lat": 44.9360, "lng": 4.8955, "city": "Valence", "postal_code": "26000", "sector": "valence_centre"},
        {"lat": 44.9285, "lng": 4.9000, "city": "Valence", "postal_code": "26000", "sector": "valence_centre"},
        {"lat": 44.9340, "lng": 4.8870, "city": "Valence", "postal_code": "26000", "sector": "valence_centre"},
        {"lat": 44.9300, "lng": 4.8940, "city": "Valence", "postal_code": "26000", "sector": "valence_centre"},

        # Zone Briffaut (tertiaire / activite)
        {"lat": 44.9050, "lng": 4.8730, "city": "Valence", "postal_code": "26000", "sector": "valence_activite"},
        {"lat": 44.9075, "lng": 4.8780, "city": "Valence", "postal_code": "26000", "sector": "valence_activite"},
        {"lat": 44.9100, "lng": 4.8700, "city": "Valence", "postal_code": "26000", "sector": "valence_activite"},
        {"lat": 44.9060, "lng": 4.8760, "city": "Valence", "postal_code": "26000", "sector": "valence_activite"},

        # Lautagne (Valence - zone tertiaire / activite)
        {"lat": 44.9065, "lng": 4.9013, "city": "Valence", "postal_code": "26000", "sector": "valence_activite"},
        {"lat": 44.9048, "lng": 4.9025, "city": "Valence", "postal_code": "26000", "sector": "valence_activite"},
        {"lat": 44.9082, "lng": 4.9017, "city": "Valence", "postal_code": "26000", "sector": "valence_activite"},
        {"lat": 44.9095, "lng": 4.9006, "city": "Valence", "postal_code": "26000", "sector": "valence_activite"},
        {"lat": 44.9052, "lng": 4.8999, "city": "Valence", "postal_code": "26000", "sector": "valence_activite"},
        {"lat": 44.9078, "lng": 4.9034, "city": "Valence", "postal_code": "26000", "sector": "valence_activite"},
        {"lat": 44.9065, "lng": 4.8715, "city": "Valence", "postal_code": "26000", "sector": "valence_activite"},
        {"lat": 44.9048, "lng": 4.8682, "city": "Valence", "postal_code": "26000", "sector": "valence_activite"},
        {"lat": 44.9082, "lng": 4.8738, "city": "Valence", "postal_code": "26000", "sector": "valence_activite"},
        {"lat": 44.9095, "lng": 4.8690, "city": "Valence", "postal_code": "26000", "sector": "valence_activite"},
        {"lat": 44.9052, "lng": 4.8750, "city": "Valence", "postal_code": "26000", "sector": "valence_activite"},
        {"lat": 44.9078, "lng": 4.8665, "city": "Valence", "postal_code": "26000", "sector": "valence_activite"},

        # Rovaltain / Gare TGV (Alixan - proche Valence)
        {"lat": 44.9910, "lng": 4.9750, "city": "Alixan", "postal_code": "26300", "sector": "valence_tgv"},
        {"lat": 44.9885, "lng": 4.9700, "city": "Alixan", "postal_code": "26300", "sector": "valence_tgv"},
        {"lat": 44.9930, "lng": 4.9800, "city": "Alixan", "postal_code": "26300", "sector": "valence_tgv"},
        {"lat": 44.9900, "lng": 4.9720, "city": "Alixan", "postal_code": "26300", "sector": "valence_tgv"},

        # Portes-les-Valence (industriel / logistique)
        {"lat": 44.8750, "lng": 4.8750, "city": "Portes-les-Valence", "postal_code": "26800", "sector": "valence_industriel"},
        {"lat": 44.8700, "lng": 4.8800, "city": "Portes-les-Valence", "postal_code": "26800", "sector": "valence_industriel"},
        {"lat": 44.8725, "lng": 4.8680, "city": "Portes-les-Valence", "postal_code": "26800", "sector": "valence_industriel"},
        {"lat": 44.8740, "lng": 4.8720, "city": "Portes-les-Valence", "postal_code": "26800", "sector": "valence_industriel"},

        # Bourg-les-Valence (mixte)
        {"lat": 44.9450, "lng": 4.8850, "city": "Bourg-les-Valence", "postal_code": "26500", "sector": "valence_centre"},
        {"lat": 44.9470, "lng": 4.8880, "city": "Bourg-les-Valence", "postal_code": "26500", "sector": "valence_centre"},

        # =========================
        # AVIGNON (VAUCLUSE)
        # =========================
        # Avignon Intra-muros (bureaux, commerces)
        {"lat": 43.9493, "lng": 4.8055, "city": "Avignon", "postal_code": "84000", "sector": "avignon_centre"},
        {"lat": 43.9510, "lng": 4.8070, "city": "Avignon", "postal_code": "84000", "sector": "avignon_centre"},
        {"lat": 43.9475, "lng": 4.8030, "city": "Avignon", "postal_code": "84000", "sector": "avignon_centre"},
        {"lat": 43.9520, "lng": 4.8090, "city": "Avignon", "postal_code": "84000", "sector": "avignon_centre"},
        {"lat": 43.9460, "lng": 4.8010, "city": "Avignon", "postal_code": "84000", "sector": "avignon_centre"},
        {"lat": 43.9500, "lng": 4.8045, "city": "Avignon", "postal_code": "84000", "sector": "avignon_centre"},

        # Courtine / Gare TGV Avignon (tertiaire)
        {"lat": 43.9217, "lng": 4.7863, "city": "Avignon", "postal_code": "84000", "sector": "avignon_tgv"},
        {"lat": 43.9230, "lng": 4.7880, "city": "Avignon", "postal_code": "84000", "sector": "avignon_tgv"},
        {"lat": 43.9200, "lng": 4.7850, "city": "Avignon", "postal_code": "84000", "sector": "avignon_tgv"},
        {"lat": 43.9245, "lng": 4.7895, "city": "Avignon", "postal_code": "84000", "sector": "avignon_tgv"},

        # Agroparc (zone technopole - bureaux, activite)
        {"lat": 43.9160, "lng": 4.8750, "city": "Avignon", "postal_code": "84000", "sector": "avignon_activite"},
        {"lat": 43.9180, "lng": 4.8770, "city": "Avignon", "postal_code": "84000", "sector": "avignon_activite"},
        {"lat": 43.9145, "lng": 4.8730, "city": "Avignon", "postal_code": "84000", "sector": "avignon_activite"},
        {"lat": 43.9170, "lng": 4.8760, "city": "Avignon", "postal_code": "84000", "sector": "avignon_activite"},
        {"lat": 43.9190, "lng": 4.8780, "city": "Avignon", "postal_code": "84000", "sector": "avignon_activite"},
        {"lat": 43.9155, "lng": 4.8740, "city": "Avignon", "postal_code": "84000", "sector": "avignon_activite"},

        # Le Pontet (zone commerciale / industrielle)
        {"lat": 43.9620, "lng": 4.8600, "city": "Le Pontet", "postal_code": "84130", "sector": "avignon_industriel"},
        {"lat": 43.9640, "lng": 4.8620, "city": "Le Pontet", "postal_code": "84130", "sector": "avignon_industriel"},
        {"lat": 43.9600, "lng": 4.8580, "city": "Le Pontet", "postal_code": "84130", "sector": "avignon_industriel"},
        {"lat": 43.9660, "lng": 4.8640, "city": "Le Pontet", "postal_code": "84130", "sector": "avignon_industriel"},

        # Villeneuve-les-Avignon (bureaux, commerces)
        {"lat": 43.9650, "lng": 4.7950, "city": "Villeneuve-les-Avignon", "postal_code": "30400", "sector": "avignon_centre"},
        {"lat": 43.9670, "lng": 4.7970, "city": "Villeneuve-les-Avignon", "postal_code": "30400", "sector": "avignon_centre"},
        {"lat": 43.9630, "lng": 4.7930, "city": "Villeneuve-les-Avignon", "postal_code": "30400", "sector": "avignon_centre"},

        # Montfavet (activite / logistique)
        {"lat": 43.9280, "lng": 4.8550, "city": "Avignon", "postal_code": "84140", "sector": "avignon_activite"},
        {"lat": 43.9300, "lng": 4.8570, "city": "Avignon", "postal_code": "84140", "sector": "avignon_activite"},
        {"lat": 43.9260, "lng": 4.8530, "city": "Avignon", "postal_code": "84140", "sector": "avignon_activite"},
        {"lat": 43.9290, "lng": 4.8560, "city": "Avignon", "postal_code": "84140", "sector": "avignon_activite"},

        # ZI Avignon Nord (industriel / entrepots)
        {"lat": 43.9750, "lng": 4.8400, "city": "Avignon", "postal_code": "84000", "sector": "avignon_industriel"},
        {"lat": 43.9770, "lng": 4.8420, "city": "Avignon", "postal_code": "84000", "sector": "avignon_industriel"},
        {"lat": 43.9730, "lng": 4.8380, "city": "Avignon", "postal_code": "84000", "sector": "avignon_industriel"},

    ]

    # Types de biens avec caracteristiques typiques (prix province Valence/Avignon)
    property_configs = {
        "office": {
            "surfaces": [80, 150, 280, 450, 600, 850, 1200, 2500],
            "years": [1975, 1985, 1995, 2005, 2010, 2015, 2018, 2022],
            "sale_prices_m2": [1200, 1500, 1800, 2200, 2600, 3000, 3500],
            "rent_prices_m2": [80, 100, 120, 150, 180, 220, 280],
            "addresses_prefix": ["Immeuble", "Centre d'affaires", "Parc tertiaire", "Bureaux"],
        },
        "warehouse": {
            "surfaces": [500, 1000, 2000, 3500, 5000, 8000, 15000],
            "years": [1975, 1985, 1995, 2005, 2010, 2015, 2020],
            "sale_prices_m2": [400, 550, 700, 900, 1100, 1300, 1600],
            "rent_prices_m2": [30, 40, 55, 70, 85, 100, 130],
            "addresses_prefix": ["Entrepot", "Batiment logistique", "Plateforme", "Hub logistique"],
        },
        "retail": {
            "surfaces": [50, 80, 150, 250, 400, 600, 1000],
            "years": [1970, 1985, 1995, 2000, 2010, 2015, 2020],
            "sale_prices_m2": [1800, 2200, 2800, 3500, 4500, 5500, 7000],
            "rent_prices_m2": [150, 200, 280, 350, 450, 550, 700],
            "addresses_prefix": ["Boutique", "Local commercial", "Magasin", "Commerce"],
        },
        "industrial": {
            "surfaces": [300, 600, 1000, 1500, 2500, 4000, 6000],
            "years": [1965, 1980, 1990, 2000, 2008, 2015, 2020],
            "sale_prices_m2": [350, 500, 650, 850, 1050, 1300, 1600],
            "rent_prices_m2": [25, 35, 50, 65, 80, 100, 130],
            "addresses_prefix": ["Atelier", "Local d'activite", "Batiment industriel", "Unite de production"],
        },
        "land": {
            "surfaces": [500, 1000, 2000, 5000, 10000, 20000, 50000],
            "years": [None, None, None, None, None, None, None],
            "sale_prices_m2": [80, 120, 180, 280, 400, 600, 1000],
            "rent_prices_m2": [8, 12, 20, 30, 45, 60, 90],
            "addresses_prefix": ["Terrain", "Parcelle", "Foncier", "Lot"],
        },
    }

    comparables = []
    base_date = date.today()

    # Rues specifiques par zone
    streets_valence = [
        "Boulevard Bancel", "Avenue Victor Hugo", "Rue Emile Augier",
        "Boulevard du General de Gaulle", "Avenue de Romans", "Rue Madier de Montjau",
        "Place de la Liberte", "Rue Faventines", "Avenue de Chabeuil",
        "Rue Jean Jaures", "Boulevard d'Alsace", "Rue Pierre Semard",
        "Avenue Sadi Carnot", "Rue Montplaisir", "Cours Joubernon",
    ]
    streets_avignon = [
        "Rue de la Republique", "Place de l'Horloge", "Rue Joseph Vernet",
        "Boulevard Saint-Roch", "Avenue Monclar", "Rue Carreterie",
        "Cours Jean Jaures", "Avenue de la Trillade", "Route de Marseille",
        "Rue des Teinturiers", "Avenue Pierre Semard", "Boulevard Limbert",
        "Avenue de Fontcouverte", "Chemin de l'Amandier", "Avenue de l'Arrousaire",
    ]

    for i, loc in enumerate(locations):
        # Determiner le type de bien selon le secteur
        if loc["sector"] in ["valence_centre", "valence_tgv", "avignon_centre", "avignon_tgv"]:
            property_types = ["office", "retail"]

        elif loc["sector"] in ["valence_industriel", "avignon_industriel"]:
            property_types = ["warehouse", "industrial"]

        elif loc["sector"] in ["valence_activite", "avignon_activite"]:
            property_types = ["office", "warehouse", "industrial"]

        else:
            property_types = ["office", "retail"]

        # Choisir les rues selon la zone
        if loc["city"] in ["Valence", "Alixan", "Portes-les-Valence", "Bourg-les-Valence"]:
            streets = streets_valence
        else:
            streets = streets_avignon

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
