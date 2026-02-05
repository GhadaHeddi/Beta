# Dockerfile Frontend React + Vite - ORYEM
FROM quay.io/fedora/nodejs-20:latest

USER root

# Répertoire de travail
WORKDIR /app

# Copie des fichiers de dépendances
COPY package.json ./

# Installation des dépendances
RUN npm install

# Copie du code source
COPY . .

# Port exposé
EXPOSE 5173

# Commande de démarrage (mode développement)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
