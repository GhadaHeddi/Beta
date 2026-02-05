#!/bin/bash
set -e

echo "🔄 Attente de la base de données..."
while ! pg_isready -h db -p 5432 -U oryem_user -q; do
  sleep 1
done
echo "✅ Base de données prête"

echo "🔄 Application des migrations Alembic..."
alembic upgrade head
echo "✅ Migrations appliquées"

echo "🚀 Démarrage du serveur..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
