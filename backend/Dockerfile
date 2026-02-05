# Dockerfile Backend FastAPI - ORYEM
FROM quay.io/fedora/python-311:latest

USER root

ARG PROXY

# Variables d'environnement
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1
ENV HTTP_PROXY=${PROXY}
ENV HTTPS_PROXY=${PROXY}
ENV http_proxy=${PROXY}
ENV https_proxy=${PROXY}

# Proxy pour le build (sera fourni via --build-arg)
ARG HTTP_PROXY
ARG HTTPS_PROXY
ENV http_proxy=$HTTP_PROXY
ENV https_proxy=$HTTPS_PROXY

# Répertoire de travail
WORKDIR /app

# Installation des dépendances système pour PostgreSQL et PostGIS
RUN dnf install -y \
    gcc \
    postgresql \
    libpq-devel \
    && dnf clean all

# Nettoyer les variables proxy après l'installation
ENV http_proxy=
ENV https_proxy=

# Copie et installation des dépendances Python
COPY requirements.txt .
RUN pip install --proxy ${HTTP_PROXY} --no-cache-dir -r requirements.txt

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


