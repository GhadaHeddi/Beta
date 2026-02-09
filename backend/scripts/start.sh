#!/bin/bash
set -e

echo "✅ Base de données prête"
echo "🔄 Application des migrations Alembic..."
alembic upgrade head
echo "✅ Migrations appliquées"

echo "🌱 Seed administrateur"
python scripts/seed_admin.py

echo "peuplement de la base de données"
python scripts/seed_admin.py

echo "🚀 Démarrage du serveur..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload