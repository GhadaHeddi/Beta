# ORYEM - Contexte Projet pour Claude Code

## Vue d'ensemble

**ORYEM** est une application web d'avis de valeur immobilier pour **Arthur Loyd** (immobilier d'entreprise).
Elle permet aux consultants de creer des avis de valeur en 5 etapes : Informations, Comparaison, Analyse, Simulation, Finalisation.

**Objectif** : reduire le temps de creation d'un avis de valeur de 1,5 jour a moins d'1 heure.

## Stack technique

| Composant | Technologie |
|-----------|-------------|
| Backend | Python 3.11+ / FastAPI 0.115 |
| Frontend | React 18 / TypeScript / Vite 6.3 / Tailwind CSS v4 / shadcn/ui (Radix UI) |
| BDD | PostgreSQL 16 + PostGIS 3.4 (donnees geospatiales) |
| ORM | SQLAlchemy 2.0 + GeoAlchemy2 + Alembic (migrations) |
| Auth | JWT (python-jose) + bcrypt via passlib |
| Cartes | Leaflet + react-leaflet |
| Graphiques | Recharts |
| Deploy | Docker (docker-compose : 4 services) |

## Structure du projet

```
Beta/
├── CLAUDE.md                          # CE FICHIER - contexte pour Claude Code
├── docker-compose.yml                 # db (PostGIS) + pgadmin + backend + frontend
├── docs/                              # Documentation technique detaillee
│   ├── ORYEM_PROMPT_INITIAL.md        # Brief projet initial (specs fonctionnelles, formules metier)
│   ├── backend/
│   │   ├── ARCHITECTURE.md            # Architecture backend, config, auth, permissions, services
│   │   ├── API.md                     # Reference complete de tous les endpoints REST
│   │   ├── MODELS.md                  # 15 modeles SQLAlchemy, enums, schemas Pydantic, migrations
│   │   └── bdd/
│   │       ├── schema-bdd.md          # Schema BDD detaille (toutes tables, relations, PostGIS)
│   │       └── schema-bdd.mmd         # Diagramme Mermaid du schema
│   └── frontend/
│       ├── ARCHITECTURE.md            # Architecture frontend, navigation, auth, services, workflow
│       └── COMPONENTS.md              # Inventaire de tous les composants (42+ app + 43+ UI)
├── backend/
│   ├── app/
│   │   ├── main.py                    # Point d'entree FastAPI (prefix /api, CORS)
│   │   ├── config.py                  # Settings via .env (Pydantic BaseSettings)
│   │   ├── database.py                # Engine SQLAlchemy + get_db() dependency
│   │   ├── models/                    # 15 modeles SQLAlchemy (voir docs/backend/MODELS.md)
│   │   ├── schemas/                   # Schemas Pydantic : user.py, project.py, property_info.py
│   │   ├── routers/                   # auth.py, admin.py, projects.py, comparables.py
│   │   ├── services/                  # auth.py, user.py, comparable_service.py
│   │   └── utils/security.py          # get_current_user, require_admin, get_user_admin_id
│   ├── alembic/versions/              # 7 migrations (schema initial -> tables detail)
│   ├── scripts/                       # seed_admin, seed_data, seed_comparable_pool
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── main.tsx                   # Entry point (AuthProvider + Toaster + Leaflet CSS)
    │   ├── app/
    │   │   ├── App.tsx                # SPA root : state `view` pour la navigation
    │   │   └── components/            # 42+ composants (pages, modals, workflow evaluation)
    │   ├── contexts/AuthContext.tsx    # Auth global (JWT localStorage, login/logout/refreshUser)
    │   ├── services/                  # projectService.ts (API client), geocodingService.ts
    │   ├── hooks/                     # useProjects, useProjectsFilters
    │   ├── types/                     # project.ts, comparable.ts
    │   └── components/ui/             # 43+ composants shadcn/ui
    └── package.json
```

## Base de donnees - 15 tables

```
users ──> projects ──┬── property_infos (1:1)
                     ├── documents (1:N)
                     ├── comparables (1:N, selectionnees)
                     ├── valuations (1:N, par methode)
                     ├── project_surfaces (1:N, par niveau)
                     ├── analysis_results (1:1, resultats agreges)
                     ├── simulations (1:N)
                     ├── document_generations (1:N)
                     └── project_shares (N:N users)

agencies ──┬── user_agencies (N:N users <-> agencies)
           └── projects (1:N, via agency_id)

Tables de reference (independantes) :
├── comparable_pool (pool central + PostGIS GEOMETRY)
└── dvf_records (donnees DVF publiques + PostGIS GEOGRAPHY)
```

> Detail complet : `docs/backend/MODELS.md` et `docs/backend/bdd/schema-bdd.md`

## Endpoints API principaux (prefix /api)

**Auth** :
- `POST /auth/login` - Connexion (OAuth2 form -> JWT)
- `GET /auth/me` - Profil utilisateur courant
- `PATCH /auth/me` - Mise a jour profil
- `POST /auth/me/change-password` - Changement mot de passe

**Projets** :
- `GET/POST /projects/` - Liste / Creation
- `GET/PUT/DELETE /projects/{id}` - CRUD (soft delete)
- `GET /projects/trash` - Corbeille
- `POST /projects/{id}/restore` - Restauration
- `DELETE /projects/{id}/permanent` - Suppression definitive

**Bien immobilier** :
- `GET/PUT /projects/{id}/property-info` - Informations du bien (upsert)

**Fichiers** :
- `POST /projects/dev/{id}/files/upload` - Upload fichier
- `GET /projects/dev/{id}/files` - Liste fichiers
- `GET/DELETE /projects/dev/{id}/files/{file_id}` - Telecharger / Supprimer

**Comparables** :
- `GET /projects/{id}/comparables/search` - Recherche spatiale PostGIS
- `GET /projects/{id}/comparables/selected` - Selection actuelle
- `POST /projects/{id}/comparables/select` - Selectionner (max 3)
- `DELETE /projects/{id}/comparables/select/{cid}` - Deselectionner
- `PUT /projects/{id}/comparables/select/{cid}/adjustment` - Ajustement %
- `POST /projects/{id}/comparables/validate` - Valider etape 2

**Partage** :
- `GET /projects/{id}/available-users?search=` - Utilisateurs disponibles
- `GET/POST /projects/{id}/shares` - Liste / Creation partage
- `PUT/DELETE /projects/{id}/shares/{user_id}` - Modifier / Supprimer

**Agences** :
- `GET /agencies/` - Liste de toutes les agences
- `GET /agencies/me` - Agences de l'utilisateur courant
- `GET /agencies/{id}` - Detail agence avec statistiques
- `POST /agencies/` - Creation d'une agence

**Admin** :
- `GET/POST /admin/consultants` - Liste / Creation consultants
- `DELETE /admin/consultants/{id}` - Suppression consultant
- `GET /admin/dashboard` - Statistiques

> **Endpoints `/dev/`** : doublons sans authentification pour le developpement. A supprimer en production.
> Reference complete : `docs/backend/API.md`

## Conventions

- **Backend** : snake_case, PEP 8, type hints, docstrings
- **Frontend** : PascalCase composants, camelCase fonctions, TypeScript strict
- **Git** : branches `feature/xxx`, `fix/xxx`, commits conventionnels (`feat:`, `fix:`, `docs:`, `refactor:`)
- **BDD** : Alembic pour toutes les migrations, jamais de modification manuelle du schema
- **API** : prefix `/api`, reponses JSON, erreurs HTTP standards (401, 403, 404)

## Roles et permissions

**Roles** :
- **ADMIN** : voit tous les projets de son equipe, gere les consultants
- **CONSULTANT** : voit ses projets + projets partages avec lui

**Permissions de partage** (project_shares) :

| Action | Proprietaire | Admin equipe | Partage read | Partage write | Partage admin |
|--------|:---:|:---:|:---:|:---:|:---:|
| Lire | oui | oui | oui | oui | oui |
| Modifier | oui | oui | - | oui | oui |
| Supprimer | oui | oui | - | - | oui |
| Partager | oui | oui | - | - | oui |

## Architecture cle

### Backend
- **FastAPI** avec routers modulaires et dependencies d'injection (get_db, get_current_user)
- **Services** encapsulent la logique metier (auth, user, comparable_service)
- **PostGIS** pour les requetes spatiales : `ST_DWithin` + distance Haversine
- **Geocodage** via Nominatim (OpenStreetMap) dans `comparable_service.py`

### Frontend
- **SPA sans routeur** : navigation par state `view` dans `App.tsx`
- **AuthContext** global : JWT stocke dans localStorage, verification au montage
- **projectService.ts** : client API centralise (fonctions auth + dev)
- **Workflow 5 etapes** : EvaluationProcess orchestre InformationsStep -> ComparisonStep -> AnalysisStep -> SimulationStep -> FinalisationStep
- **shadcn/ui** : 43+ composants Radix UI styles avec Tailwind

## Points d'attention

- Le frontend est un SPA sans react-router (navigation par state dans App.tsx)
- PostGIS est requis pour la recherche de comparables (ST_DWithin, index GIST)
- Les fichiers uploades vont dans `/app/uploaded_files/project_{id}/` (volume Docker)
- Le soft delete utilise `deleted_at` (retention 15 jours)
- Les donnees de test sont generees par `scripts/seed_comparable_pool.py` (50-70 comparables Ile-de-France)
- Certains endpoints frontend appellent les routes `/dev/` (sans auth) - a migrer
- Les imports frontend utilisent l'alias `@` -> `src/` (vite.config.ts)
- Tailwind CSS v4 utilise le plugin Vite, pas de fichier tailwind.config

## Commandes utiles

```bash
# Demarrer tous les services
docker-compose up --build

# Migration BDD
docker-compose exec backend alembic upgrade head

# Nouvelle migration
docker-compose exec backend alembic revision --autogenerate -m "description"

# Seed donnees
docker-compose exec backend python -m scripts.seed_admin
docker-compose exec backend python -m scripts.seed_data
docker-compose exec backend python -m scripts.seed_comparable_pool

# Frontend dev (hors Docker)
cd frontend && npm install && npm run dev

# Backend dev (hors Docker)
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload
```

## Documentation technique detaillee

| Document | Contenu |
|----------|---------|
| `docs/ORYEM_PROMPT_INITIAL.md` | Brief projet, specs fonctionnelles, formules metier, plan sprints |
| `docs/backend/ARCHITECTURE.md` | Architecture backend, config, flux auth, permissions, service comparables |
| `docs/backend/API.md` | Reference complete : tous les endpoints, schemas, permissions, exemples |
| `docs/backend/MODELS.md` | 15 modeles SQLAlchemy, 11 enums, schemas Pydantic, 7 migrations Alembic |
| `docs/backend/bdd/schema-bdd.md` | Schema BDD complet, tables, relations, PostGIS, workflow typique |
| `docs/frontend/ARCHITECTURE.md` | Architecture frontend, navigation, AuthContext, services, workflow |
| `docs/frontend/COMPONENTS.md` | Inventaire composants : 42+ applicatifs, 43+ UI (shadcn), hooks, contextes |
