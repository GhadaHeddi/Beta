# ORYEM - Avis de Valeur Immobilier

Application web pour la création d'avis de valeur immobiliers pour Arthur Loyd Valence/Avignon.

## Contexte

**Client :** Arthur Loyd Valence / Avignon (Sébastien BESSON) + SBINVEST
**Durée :** 12 janvier 2026 → 30 juin 2026 (6 mois)
**Équipe :** 3 étudiants Esisar
- Baptiste JOUBERT
- Ghada HEDDI
- Noé GODET

**Objectif :** Réduire le temps de création d'un avis de valeur de **1,5 jour** à **moins d'1 heure**.

## Stack Technique

| Composant | Technologie |
|-----------|-------------|
| **Backend** | Python 3.11+ / FastAPI |
| **Frontend** | React.js + Vite + Tailwind CSS + shadcn/ui |
| **Base de données** | PostgreSQL + PostGIS |
| **Déploiement** | Docker + Docker Compose |
| **ORM** | SQLAlchemy |
| **Migrations** | Alembic |

## Structure du Projet

```
oryem/
├── backend/                # API FastAPI
│   ├── app/
│   │   ├── models/        # Modèles SQLAlchemy
│   │   ├── schemas/       # Schémas Pydantic
│   │   ├── routers/       # Routes API
│   │   ├── services/      # Logique métier
│   │   ├── utils/         # Utilitaires
│   │   ├── main.py        # Point d'entrée
│   │   ├── config.py      # Configuration
│   │   └── database.py    # Connexion BDD
│   ├── alembic/           # Migrations
│   ├── tests/             # Tests unitaires
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/              # Application React
│   ├── src/
│   │   ├── components/    # Composants React
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # Appels API
│   │   ├── types/         # Types TypeScript
│   │   └── App.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
│
├── uploads/               # Fichiers uploadés
├── data/dvf/             # Données DVF
├── docker-compose.yml
└── README.md
```

## Installation et Démarrage

### Prérequis

- Docker et Docker Compose installés
- Git

### Configuration

1. Cloner le repository :
```bash
git clone <url-du-repo>
cd oryem
```

2. Copier et configurer les fichiers d'environnement :
```bash
# Racine
cp .env.example .env

# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

3. Modifier les variables d'environnement si nécessaire, notamment `SECRET_KEY` pour la production.

### Démarrage avec Docker

```bash
# Lancer tous les services (PostgreSQL + Backend + Frontend)
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down
```

**Services accessibles :**
- Frontend : http://localhost:5173
- Backend API : http://localhost:8000
- Documentation API : http://localhost:8000/api/docs
- PostgreSQL : localhost:5432

### Développement local (sans Docker)

#### Backend

```bash
cd backend

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Installer les dépendances
pip install -r requirements.txt

# Lancer le serveur
uvicorn app.main:app --reload
```

#### Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

## Migrations de Base de Données

```bash
# Entrer dans le conteneur backend
docker-compose exec backend bash

# Créer une nouvelle migration
alembic revision --autogenerate -m "Description de la migration"

# Appliquer les migrations
alembic upgrade head

# Revenir à la migration précédente
alembic downgrade -1

# Voir l'historique des migrations
alembic history
```

## Workflow de Développement

### Branches Git

- `main` : branche principale (stable)
- `develop` : branche de développement
- `feature/nom-feature` : nouvelles fonctionnalités
- `fix/nom-bug` : corrections de bugs

### Commits Conventionnels

```
feat: Ajout de l'authentification
fix: Correction du bug de connexion
docs: Mise à jour de la documentation
refactor: Refactorisation du service d'évaluation
test: Ajout de tests pour les comparables
```

## Fonctionnalités MVP

### Sprint 0 (Semaines 1-2) - Setup ✅
- [x] Structure du projet
- [x] Backend FastAPI initialisé
- [x] Modèles SQLAlchemy créés
- [x] Configuration Alembic
- [x] Docker Compose configuré
- [x] Frontend migré

### Sprint 1 (Semaines 3-4) - Authentification
- [ ] Système de connexion/déconnexion
- [ ] Gestion JWT
- [ ] Page de profil utilisateur

### Sprint 2 (Semaines 5-6) - Gestion des Projets
- [ ] CRUD Projets
- [ ] Liste des projets récents
- [ ] Modal de création

### Sprint 3 (Semaines 7-8) - Étape Informations
- [ ] Formulaire du bien
- [ ] Upload de documents
- [ ] Carte interactive
- [ ] Analyse SWOT

### Sprint 4 (Semaines 9-11) - DVF + Comparaison
- [ ] Import DVF
- [ ] Recherche de comparables
- [ ] Tableau comparatif

### Sprint 5 (Semaines 12-14) - Analyse + Simulation
- [ ] Indicateurs de marché
- [ ] Calculatrices financières

### Sprint 6 (Semaines 15-17) - Finalisation
- [ ] Génération PDF
- [ ] Export document

### Sprint 7 (Semaines 18-20) - Stabilisation
- [ ] Corrections bugs
- [ ] Documentation
- [ ] Tests

## API Documentation

Une fois le backend lancé, la documentation interactive est disponible sur :
- Swagger UI : http://localhost:8000/api/docs
- ReDoc : http://localhost:8000/api/redoc

## Tests

```bash
# Backend
cd backend
pytest

# Avec couverture
pytest --cov=app tests/

# Frontend
cd frontend
npm run test
```

## Ressources

- **DVF** : https://app.dvf.etalab.gouv.fr/
- **Cadastre** : https://cadastre.data.gouv.fr/
- **FastAPI Docs** : https://fastapi.tiangolo.com/
- **React Docs** : https://react.dev/
- **shadcn/ui** : https://ui.shadcn.com/

## Support

Pour toute question, contacter l'équipe :
- Baptiste JOUBERT
- Ghada HEDDI
- Noé GODET

**Encadrement :**
- Responsable projet école : Jean-Marie DANG
- Tuteur académique : Jean-Baptiste CAIGNAERT
- Tuteur entreprise : Sébastien BESSON

---

*Projet ORYEM - Esisar 2026*
