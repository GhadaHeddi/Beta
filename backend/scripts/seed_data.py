#!/usr/bin/env python3
"""
Script pour peupler la base de données avec des données de test.
Crée 4 consultants et 5 projets.
Usage: python scripts/seed_data.py
"""
import sys
import os

# Ajouter le répertoire parent au path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User, UserRole, Project, ProjectStatus, PropertyType

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
        # Vérifier si le consultant existe déjà
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
    """Crée 5 projets de test répartis entre les consultants."""
    projects_data = [
        {
            "title": "Tour Montparnasse - Bureaux",
            "address": "33 Avenue du Maine 75015 Paris",
            "property_type": PropertyType.OFFICE,
            "status": ProjectStatus.IN_PROGRESS,
            "current_step": 3,
            "consultant_index": 0
        },
        {
            "title": "Entrepôt Logistique Roissy",
            "address": "Zone Technique 95700 Roissy-en-France",
            "property_type": PropertyType.WAREHOUSE,
            "status": ProjectStatus.DRAFT,
            "current_step": 1,
            "consultant_index": 1
        },
        {
            "title": "Centre Commercial Les Halles",
            "address": "101 Porte Berger 75001 Paris",
            "property_type": PropertyType.RETAIL,
            "status": ProjectStatus.COMPLETED,
            "current_step": 5,
            "consultant_index": 2
        },
        {
            "title": "Local Industriel Gennevilliers",
            "address": "106 Av. du Vieux Chemin de Saint-Denis 92230 Gennevilliers",
            "property_type": PropertyType.INDUSTRIAL,
            "status": ProjectStatus.IN_PROGRESS,
            "current_step": 2,
            "consultant_index": 3
        },
        {
            "title": "Terrain Constructible Versailles",
            "address": "4 Avenue de Paris 78000 Versailles",
            "property_type": PropertyType.LAND,
            "status": ProjectStatus.DRAFT,
            "current_step": 1,
            "consultant_index": 0
        }
    ]

    projects = []
    for data in projects_data:
        consultant = consultants[data["consultant_index"]]

        # Vérifier si le projet existe déjà (par titre et user_id)
        existing = db.query(Project).filter(
            Project.title == data["title"],
            Project.user_id == consultant.id
        ).first()

        if existing:
            print(f"   Projet existant: {data['title']}")
            projects.append(existing)
            continue

        project = Project(
            user_id=consultant.id,
            title=data["title"],
            address=data["address"],
            property_type=data["property_type"],
            status=data["status"],
            current_step=data["current_step"]
        )
        db.add(project)
        projects.append(project)
        print(f"   Projet créé: {data['title']} (assigné à {consultant.first_name} {consultant.last_name})")

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
        # 1. Récupérer ou créer l'admin
        print("\n1. Vérification/Création de l'administrateur...")
        admin = get_admin(db)
        print(f"   Admin disponible: {admin.email} (ID: {admin.id})")

        # 2. Créer les consultants
        print("\n2. Création des 4 consultants...")
        consultants = create_consultants(db, admin)
        print(f"   {len(consultants)} consultants disponibles")

        # 3. Créer les projets
        print("\n3. Création des 5 projets...")
        projects = create_projects(db, consultants)
        print(f"   {len(projects)} projets disponibles")

        # Résumé
        print("\n" + "=" * 50)
        print("RESUME")
        print("=" * 50)
        print(f"\nConsultants créés (mot de passe: consultant123):")
        for c in consultants:
            print(f"  - {c.first_name} {c.last_name} ({c.email})")

        print(f"\nProjets créés:")
        for p in projects:
            owner = db.query(User).filter(User.id == p.user_id).first()
            print(f"  - {p.title}")
            print(f"    Type: {p.property_type.value}, Statut: {p.status.value}")
            print(f"    Propriétaire: {owner.first_name} {owner.last_name}")

    except Exception as e:
        print(f"\nErreur: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

    print("\n" + "=" * 50)
    print("Seed terminé avec succès!")
    print("=" * 50)


if __name__ == "__main__":
    main()
