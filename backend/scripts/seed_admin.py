#!/usr/bin/env python3
"""
Script pour créer l'administrateur initial dans la base de données.
Usage: python scripts/seed_admin.py
"""
import sys
import os

# Ajouter le répertoire parent au path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User, UserRole
from app.config import settings

# Configuration du hachage de mot de passe
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_admin(db: Session) -> User:
    """Crée l'administrateur initial s'il n'existe pas."""

    # Configuration admin (peut être surchargée via .env)
    admin_email = os.getenv("ADMIN_EMAIL", "admin@oryem.fr")
    admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
    admin_first_name = os.getenv("ADMIN_FIRST_NAME", "Admin")
    admin_last_name = os.getenv("ADMIN_LAST_NAME", "ORYEM")

    # Vérifier si l'admin existe déjà
    existing_admin = db.query(User).filter(User.email == admin_email).first()
    if existing_admin:
        print(f"⚠️  L'administrateur {admin_email} existe déjà.")
        return existing_admin

    # Créer l'admin
    admin = User(
        email=admin_email,
        password_hash=get_password_hash(admin_password),
        first_name=admin_first_name,
        last_name=admin_last_name,
        role=UserRole.ADMIN,
        admin_id=None  # L'admin n'a pas de superviseur
    )

    db.add(admin)
    db.commit()
    db.refresh(admin)

    print(f"✅ Administrateur créé avec succès!")
    print(f"   Email: {admin_email}")
    print(f"   Mot de passe: {admin_password}")
    print(f"   ⚠️  Pensez à changer le mot de passe en production!")

    return admin


def main():
    print("🔧 Création de l'administrateur ORYEM...")
    print("-" * 40)

    db = SessionLocal()
    try:
        create_admin(db)
    except Exception as e:
        print(f"❌ Erreur lors de la création de l'admin: {e}")
        sys.exit(1)
    finally:
        db.close()

    print("-" * 40)
    print("✅ Seed terminé!")


if __name__ == "__main__":
    main()
