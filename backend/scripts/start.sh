#!/bin/bash
set -e
echo "🔄 Attente de la base de données..."
until python -c "import psycopg2; psycopg2.connect('postgresql://oryem_user:oryem_password@db:5432/oryem_db')" 2>/dev/null; do
  sleep 1
done
echo "✅ Base de données prête"
echo "🔄 Application des migrations Alembic..."
alembic upgrade head
echo "✅ Migrations appliquées"
echo "🚀 Démarrage du serveur..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload