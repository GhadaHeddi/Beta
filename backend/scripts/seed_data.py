#!/usr/bin/env python3
"""
Script pour peupler la base de données avec des données de test.
Crée 4 consultants et des projets avec PropertyInfo (coordonnées GPS).
Usage: python scripts/seed_data.py
"""
import sys
import os

# Ajouter le répertoire parent au path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User, UserRole, Project, ProjectStatus, PropertyType, PropertyInfo

# Configuration du hachage de mot de passe
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def get_admin(db: Session) -> User:
    """Récupère l'admin existant"""
    admin = db.query(User).filter(User.role == UserRole.ADMIN).first()
    return admin


def create_consultants(db: Session, admin: User) -> list[User]:
    """Crée 4 consultants de test."""
    consultants_data = [
        {
            "email": "jean.dupont@oryem.fr",
            "first_name": "Jean",
            "last_name": "Dupont",
            "phone": "+33 6 12 34 56 78"
        },
        {
            "email": "marie.martin@oryem.fr",
            "first_name": "Marie",
            "last_name": "Martin",
            "phone": "+33 6 23 45 67 89"
        },
        {
            "email": "pierre.bernard@oryem.fr",
            "first_name": "Pierre",
            "last_name": "Bernard",
            "phone": "+33 6 34 56 78 90"
        },
        {
            "email": "sophie.leroy@oryem.fr",
            "first_name": "Sophie",
            "last_name": "Leroy",
            "phone": "+33 6 45 67 89 01"
        }
    ]

    consultants = []
    for data in consultants_data:
        existing = db.query(User).filter(User.email == data["email"]).first()
        if existing:
            print(f"   Consultant existant: {data['email']}")
            consultants.append(existing)
            continue

        consultant = User(
            email=data["email"],
            password_hash=get_password_hash("consultant123"),
            first_name=data["first_name"],
            last_name=data["last_name"],
            phone=data["phone"],
            role=UserRole.CONSULTANT,
            admin_id=admin.id
        )
        db.add(consultant)
        consultants.append(consultant)
        print(f"   Consultant créé: {data['email']}")

    db.commit()
    for c in consultants:
        db.refresh(c)

    return consultants


def create_projects(db: Session, consultants: list[User]) -> list[Project]:
    """Crée des projets de test avec PropertyInfo (coordonnées GPS)."""
    projects_data = [
        # =========================
        # VALENCE (26000)
        # =========================
        {
            "title": "Arthur Loyd Valence - Siege",
            "address": "19 Avenue des Langories, 26000 Valence",
            "long_address": "19, Avenue des Langories, Valence, Drome, Auvergne-Rhone-Alpes, France metropolitaine, 26000, France",
            "property_type": PropertyType.OFFICE,
            "status": ProjectStatus.COMPLETED,
            "current_step": 5,
            "consultant_index": 0,
            "lat": 44.9196, "lng": 4.9248,
            "geographic_sector": "Valence Sud",
        },
        {
            "title": "Bureaux Centre-ville Valence",
            "address": "1 Place de la Liberte, 26000 Valence",
            "long_address": "1, Place de la Liberte, Centre-Ville, Valence, Drome, Auvergne-Rhone-Alpes, France metropolitaine, 26000, France",
            "property_type": PropertyType.OFFICE,
            "status": ProjectStatus.IN_PROGRESS,
            "current_step": 3,
            "consultant_index": 1,
            "lat": 44.9334, "lng": 4.8924,
            "geographic_sector": "Valence Centre",
        },
        {
            "title": "Local commercial Boulevard Bancel",
            "address": "45 Boulevard du General de Gaulle, 26000 Valence",
            "long_address": "45, Boulevard du General de Gaulle, Valence, Drome, Auvergne-Rhone-Alpes, France metropolitaine, 26000, France",
            "property_type": PropertyType.RETAIL,
            "status": ProjectStatus.IN_PROGRESS,
            "current_step": 3,
            "consultant_index": 0,
            "lat": 44.9305, "lng": 4.8870,
            "geographic_sector": "Valence Centre",
        },
        {
            "title": "Immeuble de bureaux - Lautagne",
            "address": "485 Rue Faventines, 26000 Valence",
            "long_address": "485, Rue Faventines, Lautagne, Valence, Drome, Auvergne-Rhone-Alpes, France metropolitaine, 26000, France",
            "property_type": PropertyType.OFFICE,
            "status": ProjectStatus.IN_PROGRESS,
            "current_step": 2,
            "consultant_index": 1,
            "lat": 44.9065, "lng": 4.9013,
            "geographic_sector": "Valence Lautagne",
        },
        {
            "title": "Parc d'activites Briffaut",
            "address": "Rue Alfred Nobel, 26000 Valence",
            "long_address": "Rue Alfred Nobel, ZI Briffaut, Valence, Drome, Auvergne-Rhone-Alpes, France metropolitaine, 26000, France",
            "property_type": PropertyType.INDUSTRIAL,
            "status": ProjectStatus.DRAFT,
            "current_step": 1,
            "consultant_index": 2,
            "lat": 44.9050, "lng": 4.8730,
            "geographic_sector": "Valence Briffaut",
        },
        {
            "title": "Local commercial Rue Madier de Montjau",
            "address": "10 Rue Madier de Montjau, 26000 Valence",
            "long_address": "10, Rue Madier de Montjau, Centre-Ville, Valence, Drome, Auvergne-Rhone-Alpes, France metropolitaine, 26000, France",
            "property_type": PropertyType.RETAIL,
            "status": ProjectStatus.IN_PROGRESS,
            "current_step": 3,
            "consultant_index": 0,
            "lat": 44.9315, "lng": 4.8890,
            "geographic_sector": "Valence Centre",
        },
        {
            "title": "Plateforme logistique Portes-les-Valence",
            "address": "11 Rue Pierre Semard, 26800 Portes-les-Valence",
            "long_address": "11, Rue Pierre Semard, Portes-les-Valence, Drome, Auvergne-Rhone-Alpes, France metropolitaine, 26800, France",
            "property_type": PropertyType.WAREHOUSE,
            "status": ProjectStatus.IN_PROGRESS,
            "current_step": 2,
            "consultant_index": 3,
            "lat": 44.8750, "lng": 4.8750,
            "geographic_sector": "Portes-les-Valence",
        },
        {
            "title": "Bureaux Parc Rovaltain TGV",
            "address": "1 Avenue de la Gare TGV, 26300 Alixan",
            "long_address": "1, Avenue de la Gare, Rovaltain, Alixan, Drome, Auvergne-Rhone-Alpes, France metropolitaine, 26300, France",
            "property_type": PropertyType.OFFICE,
            "status": ProjectStatus.COMPLETED,
            "current_step": 5,
            "consultant_index": 1,
            "lat": 44.9910, "lng": 4.9750,
            "geographic_sector": "Rovaltain TGV",
        },
        {
            "title": "Terrain ZAC Valence Sud",
            "address": "Avenue de Romans, 26000 Valence",
            "long_address": "Avenue de Romans, Valence, Drome, Auvergne-Rhone-Alpes, France metropolitaine, 26000, France",
            "property_type": PropertyType.LAND,
            "status": ProjectStatus.DRAFT,
            "current_step": 1,
            "consultant_index": 2,
            "lat": 44.9150, "lng": 4.9100,
            "geographic_sector": "Valence Sud",
        },
        {
            "title": "Entrepot Zone Lautagne",
            "address": "Rue de la Forêt, 26000 Valence",
            "long_address": "Rue de la Forêt, Lautagne, Valence, Drome, Auvergne-Rhone-Alpes, France metropolitaine, 26000, France",
            "property_type": PropertyType.WAREHOUSE,
            "status": ProjectStatus.IN_PROGRESS,
            "current_step": 4,
            "consultant_index": 3,
            "lat": 44.9082, "lng": 4.9034,
            "geographic_sector": "Valence Lautagne",
        },
        # =========================
        # AVIGNON (84000)
        # =========================
        {
            "title": "Bureaux Intra-muros Avignon",
            "address": "15 Rue de la Republique, 84000 Avignon",
            "long_address": "15, Rue de la Republique, Centre Historique, Avignon, Vaucluse, Provence-Alpes-Cote d'Azur, France metropolitaine, 84000, France",
            "property_type": PropertyType.OFFICE,
            "status": ProjectStatus.IN_PROGRESS,
            "current_step": 3,
            "consultant_index": 0,
            "lat": 43.9493, "lng": 4.8055,
            "geographic_sector": "Avignon Intra-muros",
        },
        {
            "title": "Local commercial Place de l'Horloge",
            "address": "8 Place de l'Horloge, 84000 Avignon",
            "long_address": "8, Place de l'Horloge, Centre Historique, Avignon, Vaucluse, Provence-Alpes-Cote d'Azur, France metropolitaine, 84000, France",
            "property_type": PropertyType.RETAIL,
            "status": ProjectStatus.IN_PROGRESS,
            "current_step": 4,
            "consultant_index": 1,
            "lat": 43.9510, "lng": 4.8065,
            "geographic_sector": "Avignon Intra-muros",
        },
        {
            "title": "Immeuble tertiaire Courtine",
            "address": "Avenue de la Croix Rouge, 84000 Avignon",
            "long_address": "Avenue de la Croix Rouge, Courtine, Avignon, Vaucluse, Provence-Alpes-Cote d'Azur, France metropolitaine, 84000, France",
            "property_type": PropertyType.OFFICE,
            "status": ProjectStatus.COMPLETED,
            "current_step": 5,
            "consultant_index": 2,
            "lat": 43.9280, "lng": 4.8200,
            "geographic_sector": "Avignon Courtine",
        },
        {
            "title": "Bureaux Agroparc Avignon",
            "address": "301 Rue Jean-Henri Fabre, 84000 Avignon",
            "long_address": "301, Rue Jean-Henri Fabre, Agroparc, Avignon, Vaucluse, Provence-Alpes-Cote d'Azur, France metropolitaine, 84000, France",
            "property_type": PropertyType.OFFICE,
            "status": ProjectStatus.IN_PROGRESS,
            "current_step": 2,
            "consultant_index": 3,
            "lat": 43.9150, "lng": 4.8750,
            "geographic_sector": "Avignon Agroparc",
        },
        {
            "title": "Commerce Centre Commercial Le Pontet",
            "address": "2 Avenue de Fontvert, 84130 Le Pontet",
            "long_address": "2, Avenue de Fontvert, Le Pontet, Vaucluse, Provence-Alpes-Cote d'Azur, France metropolitaine, 84130, France",
            "property_type": PropertyType.RETAIL,
            "status": ProjectStatus.IN_PROGRESS,
            "current_step": 3,
            "consultant_index": 0,
            "lat": 43.9600, "lng": 4.8600,
            "geographic_sector": "Le Pontet",
        },
        {
            "title": "Entrepot Zone Courtine Avignon",
            "address": "Chemin de Courtine, 84000 Avignon",
            "long_address": "Chemin de Courtine, Courtine, Avignon, Vaucluse, Provence-Alpes-Cote d'Azur, France metropolitaine, 84000, France",
            "property_type": PropertyType.WAREHOUSE,
            "status": ProjectStatus.DRAFT,
            "current_step": 1,
            "consultant_index": 1,
            "lat": 43.9250, "lng": 4.8150,
            "geographic_sector": "Avignon Courtine",
        },
        {
            "title": "Local d'activite Montfavet",
            "address": "Route de Marseille, 84140 Montfavet",
            "long_address": "Route de Marseille, Montfavet, Avignon, Vaucluse, Provence-Alpes-Cote d'Azur, France metropolitaine, 84140, France",
            "property_type": PropertyType.INDUSTRIAL,
            "status": ProjectStatus.IN_PROGRESS,
            "current_step": 2,
            "consultant_index": 2,
            "lat": 43.9200, "lng": 4.8500,
            "geographic_sector": "Montfavet",
        },
        {
            "title": "Terrain Agroparc Extension",
            "address": "Rue Pierre Bayle, 84000 Avignon",
            "long_address": "Rue Pierre Bayle, Agroparc, Avignon, Vaucluse, Provence-Alpes-Cote d'Azur, France metropolitaine, 84000, France",
            "property_type": PropertyType.LAND,
            "status": ProjectStatus.DRAFT,
            "current_step": 1,
            "consultant_index": 3,
            "lat": 43.9120, "lng": 4.8800,
            "geographic_sector": "Avignon Agroparc",
        },
        {
            "title": "Bureaux Villeneuve-les-Avignon",
            "address": "12 Rue de la Foire, 30400 Villeneuve-les-Avignon",
            "long_address": "12, Rue de la Foire, Villeneuve-les-Avignon, Gard, Occitanie, France metropolitaine, 30400, France",
            "property_type": PropertyType.OFFICE,
            "status": ProjectStatus.COMPLETED,
            "current_step": 5,
            "consultant_index": 0,
            "lat": 43.9650, "lng": 4.7950,
            "geographic_sector": "Villeneuve-les-Avignon",
        },
        {
            "title": "Commerce Rue de la Bonneterie Avignon",
            "address": "22 Rue de la Bonneterie, 84000 Avignon",
            "long_address": "22, Rue de la Bonneterie, Centre Historique, Avignon, Vaucluse, Provence-Alpes-Cote d'Azur, France metropolitaine, 84000, France",
            "property_type": PropertyType.RETAIL,
            "status": ProjectStatus.IN_PROGRESS,
            "current_step": 3,
            "consultant_index": 1,
            "lat": 43.9480, "lng": 4.8080,
            "geographic_sector": "Avignon Intra-muros",
        },
    ]

    projects = []
    for data in projects_data:
        consultant = consultants[data["consultant_index"]]

        # Vérifier si le projet existe déjà
        existing = db.query(Project).filter(
            Project.title == data["title"],
            Project.user_id == consultant.id
        ).first()

        if existing:
            print(f"   Projet existant: {data['title']}")
            # Mettre a jour les coordonnees si manquantes
            prop_info = db.query(PropertyInfo).filter(PropertyInfo.project_id == existing.id).first()
            if not prop_info:
                prop_info = PropertyInfo(
                    project_id=existing.id,
                    latitude=data["lat"],
                    longitude=data["lng"],
                    geographic_sector=data.get("geographic_sector", ""),
                )
                db.add(prop_info)
            elif not prop_info.latitude:
                prop_info.latitude = data["lat"]
                prop_info.longitude = data["lng"]
                prop_info.geographic_sector = data.get("geographic_sector", "")
            # Mettre a jour long_address si manquant
            if not existing.long_address and data.get("long_address"):
                existing.long_address = data["long_address"]
            projects.append(existing)
            continue

        project = Project(
            user_id=consultant.id,
            title=data["title"],
            address=data["address"],
            long_address=data.get("long_address"),
            property_type=data["property_type"],
            status=data["status"],
            current_step=data["current_step"]
        )
        db.add(project)
        db.flush()  # Pour obtenir l'ID du projet

        # Creer PropertyInfo avec coordonnees GPS
        prop_info = PropertyInfo(
            project_id=project.id,
            latitude=data["lat"],
            longitude=data["lng"],
            geographic_sector=data.get("geographic_sector", ""),
        )
        db.add(prop_info)

        projects.append(project)
        print(f"   Projet créé: {data['title']} ({data['lat']}, {data['lng']})")

    db.commit()
    for p in projects:
        db.refresh(p)

    return projects


def main():
    print("=" * 50)
    print("Peuplement de la base de données ORYEM")
    print("=" * 50)

    db = SessionLocal()
    try:
        # 1. Récupérer l'admin
        print("\n1. Vérification de l'administrateur...")
        admin = get_admin(db)
        if not admin:
            print("   ERREUR: Aucun admin trouvé. Lancez d'abord seed_admin.py")
            sys.exit(1)
        print(f"   Admin disponible: {admin.email} (ID: {admin.id})")

        # 2. Créer les consultants
        print("\n2. Création des consultants...")
        consultants = create_consultants(db, admin)
        print(f"   {len(consultants)} consultants disponibles")

        # 3. Créer les projets avec coordonnées
        print("\n3. Création des projets (Valence + Avignon)...")
        projects = create_projects(db, consultants)
        print(f"   {len(projects)} projets disponibles")

        # Résumé
        print("\n" + "=" * 50)
        print("RESUME")
        print("=" * 50)
        print(f"\nConsultants (mot de passe: consultant123):")
        for c in consultants:
            print(f"  - {c.first_name} {c.last_name} ({c.email})")

        print(f"\nProjets ({len(projects)}):")
        for p in projects:
            owner = db.query(User).filter(User.id == p.user_id).first()
            prop = db.query(PropertyInfo).filter(PropertyInfo.project_id == p.id).first()
            coords = f"({prop.latitude}, {prop.longitude})" if prop and prop.latitude else "(pas de coords)"
            print(f"  - {p.title} {coords}")
            print(f"    {p.address} | {p.status.value}")

    except Exception as e:
        print(f"\nErreur: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

    print("\n" + "=" * 50)
    print("Seed terminé avec succès!")
    print("=" * 50)


if __name__ == "__main__":
    main()
