FROM quay.io/fedora/nodejs-20:latest

USER root

ARG PROXY
ENV HTTP_PROXY=${PROXY}
ENV HTTPS_PROXY=${PROXY}
ENV http_proxy=${PROXY}
ENV https_proxy=${PROXY}

ARG PROXY

ENV HTTP_PROXY=${PROXY}
ENV HTTPS_PROXY=${PROXY}
ENV http_proxy=${PROXY}
ENV https_proxy=${PROXY}

# Répertoire de travail
WORKDIR /app

# Copie des fichiers de dépendances
COPY package.json ./

# Installation des dépendances
RUN npm config set proxy ${HTTP_PROXY}
RUN npm config set https-proxy ${HTTP_PROXY}
RUN npm install --legacy-peer-deps

# Nettoyer les variables proxy après l'installation
ENV http_proxy=
ENV https_proxy=
# Copie du code source
COPY . .

# Port exposé
EXPOSE 5173

# Commande de démarrage (mode développement)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
