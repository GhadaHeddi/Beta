# Dockerfile Backend FastAPI - ORYEM
FROM python:3.11-slim

# Variables d'environnement
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Répertoire de travail
WORKDIR /app

# Installation des dépendances système pour PostgreSQL et PostGIS
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copie et installation des dépendances Python
COPY requirements.txt .
RUN pip install --proxy http://pi03joubertb:Ge5Hg2Rs7Ze3Jz9Nb4My@proxy-http.esisar.grenoble-inp.fr:3128 --no-cache-dir -r requirements.txt

# Copie du code source
COPY . .

# Création du dossier uploads
RUN mkdir -p uploads

# Copie et permissions du script de démarrage
COPY scripts/start.sh /start.sh
RUN chmod +x /start.sh

# Port exposé
EXPOSE 8000

# Commande de démarrage (migrations + serveur)
CMD ["/start.sh"]
