# 🏢 ORYEM - Prompt Initial du Projet

## 📋 Informations Générales

**Nom du projet :** ORYEM  
**Client :** Arthur Loyd Valence / Avignon (Sébastien BESSON) + SBINVEST  
**Durée :** 12 janvier 2026 → 30 juin 2026 (6 mois)  
**Équipe :** 3 étudiants Esisar à temps plein (35-40h/semaine)
- Baptiste JOUBERT
- Ghada HEDDI  
- Noé GODET

**Encadrement :**
- Responsable projet école : Jean-Marie DANG
- Tuteur académique : Jean-Baptiste CAIGNAERT
- Tuteur entreprise : Sébastien BESSON

---

## 🎯 Objectif du Projet

Développer un **prototype fonctionnel d'application web** permettant aux consultants immobiliers d'Arthur Loyd de créer des **avis de valeur** pour l'immobilier d'entreprise (bureaux, locaux d'activités, entrepôts, commerces, terrains).

**Problème résolu :** Réduire le temps de création d'un avis de valeur de **1,5 jour** à **moins d'1 heure** en centralisant les données et en automatisant les analyses.

**Vision long terme :** Application évolutive vers un assistant IA conversationnel capable de piloter l'application et d'accompagner le consultant dans son raisonnement.

---

## 🛠️ Stack Technique

| Composant | Technologie |
|-----------|-------------|
| **Backend** | Python 3.11+ / FastAPI |
| **Frontend** | React.js (avec Vite, Tailwind CSS, shadcn/ui) |
| **Base de données** | PostgreSQL (avec PostGIS pour les données géo) |
| **Déploiement** | Docker (local uniquement pour le MVP) |
| **Versioning** | Git / GitHub |
| **Gestion de projet** | GitHub Project + Notion |

---

## 👥 Utilisateurs et Authentification

### Rôle unique (MVP)
- **Consultant** : peut créer, modifier, consulter tous les avis de valeur

### Authentification
- Système classique email/mot de passe
- Création des comptes par un administrateur (pas d'inscription libre)
- Un consultant peut voir les avis de valeur des autres consultants

---

## 📊 Sources de Données

### Sources confirmées
1. **DVF (Demandes de Valeurs Foncières)** - à importer et stocker en base PostgreSQL
2. **Données cadastrales** - API publique
3. **Données internes Arthur Loyd** - fichiers Excel (transactions passées, avis de valeur antérieurs)

### Sources futures (hors MVP)
- SeLoger (scraping)
- LeBonCoin (scraping)
- Autres sources selon faisabilité technique et légale

---

## 📄 Structure d'un Avis de Valeur

D'après le template Arthur Loyd, un avis de valeur comprend **5 sections** :

### 1. Préambule
- Page de garde (photo du bien, consultant, date, client)
- Sommaire
- Avertissement / Confidentialité
- Objet de la mission

### 2. Bien & Environnement
- Vue satellite
- Vue cadastrale (avec numéros de parcelles et surfaces)
- Photos du bien (extérieur/intérieur)
- Historique du bien (images satellites chronologiques)
- Désignation et description détaillée
- Tableau des surfaces (étage, type, surface)
- Informations propriétaire
- Environnement PLU (zone, règlement)
- Orientations d'Aménagement et de Programmation (OAP)
- Servitudes
- Zones inondables

### 3. Analyse de Marché
- Évolution de la demande placée (en volume m²)
- Répartition neuf / seconde main
- Répartition location / vente
- Commentaire expert

### 4. Préconisation (Estimation)
- **Méthode par comparaison** : tableau des biens comparables vendus (surface, valeur, ratio €/m²)
- **Méthode par le revenu (loyer estimé)** : L / R / (1 + D)
  - L = Loyer net annuel estimé
  - R = Taux de rendement (ex: 8%)
  - D = Droits de mutation (7,40%)
- **Méthode par le revenu (loyer constaté)** : même formule avec loyer réel
- **Synthèse** : tableau récapitulatif avec pondération des méthodes

### 5. Annexes
- Équipe Arthur Loyd
- Coordonnées
- Page de clôture

---

## 🖥️ Fonctionnalités MVP

### F1 - Authentification
- [ ] Connexion / Déconnexion
- [ ] Gestion de session (JWT)
- [ ] Page de profil utilisateur

### F2 - Gestion des Projets (Avis de Valeur)
- [ ] Liste des projets récents (page d'accueil)
- [ ] Création d'un nouveau projet
- [ ] Suppression d'un projet
- [ ] Filtrage et recherche

### F3 - Workflow de Création d'Avis de Valeur (5 étapes)

#### Étape 1 : Informations
- [ ] Formulaire : titre, adresse, type de bien, propriétaire, occupant
- [ ] Caractéristiques : année de construction, matériaux, secteur géographique
- [ ] Upload de documents (plans, photos, diagnostics)
- [ ] Visualisation des documents uploadés
- [ ] Carte interactive avec localisation du bien
- [ ] Analyse SWOT du bien (forces, faiblesses, opportunités, menaces)
- [ ] Zone de notes libres

#### Étape 2 : Comparaison
- [ ] Moteur de recherche de biens comparables (filtres : surface, distance, type)
- [ ] Affichage des résultats avec carte
- [ ] Sélection de biens pour comparaison détaillée (max 3)
- [ ] Tableau comparatif (caractéristiques côte à côte)
- [ ] Validation des comparables retenus
- [ ] Ajustement de décote/surcote par comparable

#### Étape 3 : Analyse
- [ ] Indicateurs de marché de la zone
- [ ] Graphiques d'évolution (demande placée, prix)
- [ ] Données du secteur géographique

#### Étape 4 : Simulation
- [ ] Calculatrice de financement (mensualités, taux, durée)
- [ ] Calculatrice de capacité d'emprunt
- [ ] Calcul des frais de notaire
- [ ] Simulation avec travaux / apport
- [ ] Calcul de réserve foncière

#### Étape 5 : Finalisation
- [ ] Sélection des indicateurs à inclure dans le rapport
- [ ] Prévisualisation du document généré (miniatures)
- [ ] Paramètres d'export (format PDF/PPTX/DOCX, qualité, langue)
- [ ] Génération et téléchargement du document

### F4 - Gestion des Documents
- [ ] Upload de fichiers (PDF, images)
- [ ] Visualisation inline des documents
- [ ] Système d'onglets pour documents ouverts (max 3)

### F5 - Données DVF
- [ ] Import des données DVF en base
- [ ] Recherche de transactions par localisation
- [ ] Affichage des transactions sur carte

---

## 🗄️ Modèle de Données (Schéma Simplifié)

```
┌─────────────────┐     ┌─────────────────────┐
│     User        │     │      Project        │
├─────────────────┤     ├─────────────────────┤
│ id              │────<│ id                  │
│ email           │     │ user_id (FK)        │
│ password_hash   │     │ title               │
│ first_name      │     │ address             │
│ last_name       │     │ property_type       │
│ phone           │     │ status              │
│ avatar_url      │     │ current_step        │
│ created_at      │     │ created_at          │
│ updated_at      │     │ updated_at          │
└─────────────────┘     └─────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ PropertyInfo    │     │   Document      │     │   Comparable    │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id              │     │ id              │     │ id              │
│ project_id (FK) │     │ project_id (FK) │     │ project_id (FK) │
│ owner_name      │     │ name            │     │ address         │
│ occupant_name   │     │ file_path       │     │ surface         │
│ construction_yr │     │ file_type       │     │ price           │
│ materials       │     │ size            │     │ price_per_m2    │
│ total_surface   │     │ uploaded_at     │     │ distance        │
│ terrain_surface │     └─────────────────┘     │ adjustment      │
│ latitude        │                             │ validated       │
│ longitude       │                             │ source          │
│ swot_strengths  │                             └─────────────────┘
│ swot_weaknesses │
│ swot_opportun.  │     ┌─────────────────┐
│ swot_threats    │     │   Valuation     │
│ notes           │     ├─────────────────┤
└─────────────────┘     │ id              │
                        │ project_id (FK) │
┌─────────────────┐     │ method          │
│   DVFRecord     │     │ value           │
├─────────────────┤     │ weight          │
│ id              │     │ parameters      │
│ mutation_date   │     └─────────────────┘
│ nature_mutation │
│ valeur_fonciere │
│ adresse         │
│ code_postal     │
│ commune         │
│ type_local      │
│ surface_reelle  │
│ nombre_pieces   │
│ latitude        │
│ longitude       │
└─────────────────┘
```

---

## 📁 Structure du Projet

```
oryem/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # Point d'entrée FastAPI
│   │   ├── config.py            # Configuration (env vars)
│   │   ├── database.py          # Connexion PostgreSQL
│   │   ├── models/              # Modèles SQLAlchemy
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── project.py
│   │   │   ├── property_info.py
│   │   │   ├── document.py
│   │   │   ├── comparable.py
│   │   │   ├── valuation.py
│   │   │   └── dvf_record.py
│   │   ├── schemas/             # Schémas Pydantic
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── project.py
│   │   │   └── ...
│   │   ├── routers/             # Routes API
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── projects.py
│   │   │   ├── documents.py
│   │   │   ├── comparables.py
│   │   │   └── dvf.py
│   │   ├── services/            # Logique métier
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py
│   │   │   ├── valuation_service.py
│   │   │   ├── dvf_service.py
│   │   │   └── document_generator.py
│   │   └── utils/               # Utilitaires
│   │       ├── __init__.py
│   │       ├── security.py      # Hash passwords, JWT
│   │       └── geo.py           # Calculs géographiques
│   ├── tests/
│   ├── alembic/                 # Migrations BDD
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── ui/              # Composants shadcn/ui
│   │   │   ├── Header.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ProjectCreation.tsx
│   │   │   ├── RecentProjects.tsx
│   │   │   ├── OffersPanel.tsx
│   │   │   └── evaluation/      # Composants du workflow
│   │   │       ├── EvaluationProcess.tsx
│   │   │       ├── EvaluationTabs.tsx
│   │   │       ├── InformationsStep.tsx
│   │   │       ├── ComparisonStep.tsx
│   │   │       ├── AnalysisStep.tsx
│   │   │       ├── SimulationStep.tsx
│   │   │       ├── FinalisationStep.tsx
│   │   │       ├── AIAssistant.tsx
│   │   │       └── DocumentViewer.tsx
│   │   ├── hooks/               # Custom hooks
│   │   ├── services/            # Appels API
│   │   ├── store/               # État global (si nécessaire)
│   │   ├── types/               # Types TypeScript
│   │   └── styles/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── Dockerfile
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 🚀 Plan de Développement par Sprints

### Sprint 0 : Setup (Semaine 1-2)
- [ ] Créer le repo GitHub
- [ ] Initialiser le projet backend FastAPI
- [ ] Initialiser le projet frontend React
- [ ] Configurer Docker et docker-compose
- [ ] Configurer PostgreSQL
- [ ] Mettre en place les migrations Alembic
- [ ] Configurer GitHub Project avec le backlog

### Sprint 1 : Authentification + Structure de base (Semaine 3-4)
- [ ] Modèle User + routes auth (register, login, logout)
- [ ] Middleware JWT
- [ ] Page de connexion React
- [ ] Layout principal (Header, navigation)
- [ ] Intégration frontend/backend

### Sprint 2 : Gestion des Projets (Semaine 5-6)
- [ ] Modèle Project + CRUD API
- [ ] Page d'accueil avec liste des projets récents
- [ ] Modal de création de projet
- [ ] Navigation vers le workflow

### Sprint 3 : Étape Informations (Semaine 7-8)
- [ ] Modèle PropertyInfo
- [ ] Formulaire complet de l'étape 1
- [ ] Upload de documents (stockage fichiers)
- [ ] Intégration carte (Leaflet ou Google Maps)
- [ ] SWOT et notes

### Sprint 4 : Données DVF + Comparaison (Semaine 9-11)
- [ ] Import DVF en base
- [ ] API de recherche DVF (par localisation, rayon)
- [ ] Interface de recherche de comparables
- [ ] Tableau comparatif
- [ ] Validation et ajustement des comparables

### Sprint 5 : Analyse + Simulation (Semaine 12-14)
- [ ] Étape Analyse (graphiques, indicateurs)
- [ ] Étape Simulation (calculatrices financières)
- [ ] Calculs automatiques (rendement, valeur estimée)

### Sprint 6 : Finalisation + Export (Semaine 15-17)
- [ ] Génération du document PDF
- [ ] Prévisualisation
- [ ] Options d'export
- [ ] Tests utilisateur avec Arthur Loyd

### Sprint 7 : Stabilisation + Documentation (Semaine 18-20)
- [ ] Corrections bugs
- [ ] Optimisation performances
- [ ] Documentation technique
- [ ] Documentation utilisateur
- [ ] Préparation du rendu final

---

## 📐 Conventions de Code

### Backend (Python)
- PEP 8
- Type hints obligatoires
- Docstrings pour les fonctions publiques
- Nommage : `snake_case` pour fonctions et variables

### Frontend (TypeScript/React)
- ESLint + Prettier
- Composants fonctionnels avec hooks
- Nommage : `PascalCase` pour composants, `camelCase` pour fonctions
- Props typées avec interfaces

### Git
- Branches : `main`, `develop`, `feature/xxx`, `fix/xxx`
- Commits conventionnels : `feat:`, `fix:`, `docs:`, `refactor:`
- Pull Requests obligatoires vers `develop`

---

## 🧮 Formules Métier

### Valeur par rendement locatif
```
Valeur HD = (Loyer_Annuel_Net / Taux_Rendement) / (1 + Droits_Mutation)
```
Exemple :
- Loyer = 97 840 €/an
- Rendement = 8%
- Droits = 7,40%
- Valeur = (97840 / 0.08) / 1.074 = **1 139 000 € HD**

### Valeur par comparaison
```
Valeur = Surface × Prix_moyen_m2_comparables
```
Avec ajustement par décote/surcote selon caractéristiques.

### Valeur pondérée finale
```
Valeur_Finale = Σ (Valeur_méthode × Pondération_méthode)
```

---

## 🔗 Ressources Utiles

- **DVF** : https://app.dvf.etalab.gouv.fr/
- **API DVF** : https://api.cquest.org/dvf
- **Cadastre** : https://cadastre.data.gouv.fr/
- **FastAPI Docs** : https://fastapi.tiangolo.com/
- **React Docs** : https://react.dev/
- **shadcn/ui** : https://ui.shadcn.com/
- **Tailwind CSS** : https://tailwindcss.com/

---

## ⚠️ Points d'Attention

1. **Pas d'IA dans le MVP** : L'assistant IA conversationnel est prévu pour une version ultérieure. Le MVP doit fonctionner sans.

2. **Données sensibles** : Anonymiser les données internes Arthur Loyd utilisées pour les tests.

3. **Performance DVF** : La base DVF peut être volumineuse. Prévoir une indexation géographique (PostGIS) et une pagination.

4. **Génération de documents** : Utiliser une librairie Python comme `python-pptx` ou `python-docx` pour générer les exports. Le template doit respecter la charte Arthur Loyd.

5. **Propriété intellectuelle** : Le code appartient à Arthur Loyd.

---

## ✅ Critères de Succès du MVP

1. Un consultant peut se connecter à l'application
2. Un consultant peut créer un nouveau projet d'avis de valeur
3. Un consultant peut renseigner les informations du bien (étape 1)
4. Un consultant peut rechercher et sélectionner des biens comparables (étape 2)
5. Un consultant peut visualiser l'analyse de marché (étape 3)
6. Un consultant peut utiliser les simulateurs financiers (étape 4)
7. Un consultant peut générer et télécharger l'avis de valeur en PDF (étape 5)
8. Les données DVF sont consultables par l'application
9. L'interface respecte la maquette validée par le client

---

*Document généré le 03/02/2026 - Version 1.0*
