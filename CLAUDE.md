# ORYEM - Contexte Projet pour Claude Code

## Vue d'ensemble

**ORYEM** est une application web d'avis de valeur immobilier pour **Arthur Loyd** (immobilier d'entreprise).
Elle permet aux consultants de creer des avis de valeur en 5 etapes : Informations, Comparaison, Analyse, Simulation, Finalisation.

## Stack technique

| Composant | Technologie |
|-----------|-------------|
| Backend | Python 3.11+ / FastAPI |
| Frontend | React 18 / TypeScript / Vite / Tailwind CSS v4 / shadcn/ui |
| BDD | PostgreSQL 16 + PostGIS (donnees geospatiales) |
| ORM | SQLAlchemy 2.0 + Alembic (migrations) |
| Auth | JWT (python-jose) + bcrypt |
| Deploy | Docker (docker-compose) |

## Structure du projet

```
Beta/
├── CLAUDE.md                          # CE FICHIER
├── docker-compose.yml                 # PostgreSQL/PostGIS + pgAdmin + Backend + Frontend
├── docs/                              # Documentation detaillee
│   ├── backend/
│   │   ├── ARCHITECTURE.md            # Architecture backend complete
│   │   ├── API.md                     # Reference de tous les endpoints
│   │   ├── MODELS.md                  # Modeles SQLAlchemy + schemas Pydantic
│   │   └── bdd/                       # Schema BDD (mermaid + markdown)
│   └── frontend/
│       ├── ARCHITECTURE.md            # Architecture frontend complete
│       └── COMPONENTS.md              # Inventaire des composants
├── backend/
│   ├── app/
│   │   ├── main.py                    # Point d'entree FastAPI (prefix /api)
│   │   ├── config.py                  # Settings via .env (Pydantic BaseSettings)
│   │   ├── database.py                # Engine SQLAlchemy + get_db()
│   │   ├── models/                    # 13 modeles SQLAlchemy
│   │   ├── schemas/                   # Schemas Pydantic (validation)
│   │   ├── routers/                   # auth, admin, projects, comparables
│   │   ├── services/                  # auth, user, comparable_service
│   │   └── utils/security.py          # JWT decode, get_current_user, require_admin
│   ├── alembic/versions/              # Migrations BDD
│   ├── scripts/                       # seed_admin, seed_data, seed_comparable_pool
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── main.tsx                   # Entry point (AuthProvider + Toaster)
    │   ├── app/
    │   │   ├── App.tsx                # SPA root (state-based views, pas de router)
    │   │   └── components/            # Pages + evaluation steps
    │   ├── contexts/AuthContext.tsx    # Auth state global (token localStorage)
    │   ├── services/                  # projectService.ts, geocodingService.ts
    │   ├── hooks/                     # useProjectsFilters, useRecentProjects
    │   └── types/                     # project.ts, comparable.ts
    └── package.json
```

## Base de donnees - 13 tables

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

Tables de reference (pas de FK projet) :
├── comparable_pool (pool central + PostGIS)
└── dvf_records (donnees DVF publiques + PostGIS)
```

## Endpoints API principaux (prefix /api)

- `POST /auth/login` - Connexion (retourne JWT)
- `GET /auth/me` - Profil utilisateur courant
- `GET/POST /projects/` - Liste / Creation projets
- `GET/PUT/DELETE /projects/{id}` - CRUD projet
- `PUT /projects/{id}/property-info` - Infos du bien
- `POST /projects/{id}/files/upload` - Upload fichier
- `GET /projects/{id}/comparables/search` - Recherche comparables (PostGIS)
- `POST /projects/{id}/comparables/select` - Selection comparable
- `POST /projects/{id}/comparables/validate` - Valider et avancer l'etape
- `POST/PUT/DELETE /projects/{id}/shares` - Partage projet
- `GET/POST /admin/consultants` - Gestion consultants (admin)

**Note** : Des endpoints `/dev/` existent sans auth pour le developpement.

## Conventions

- **Backend** : snake_case, PEP 8, type hints
- **Frontend** : PascalCase composants, camelCase fonctions, TypeScript strict
- **Git** : branches `feature/xxx`, `fix/xxx`, commits conventionnels (`feat:`, `fix:`, `docs:`)
- **BDD** : Alembic pour les migrations, jamais de modification manuelle

## Roles utilisateur

- **ADMIN** : voit tous les projets de son equipe, gere les consultants
- **CONSULTANT** : voit ses projets + projets partages avec lui

## Permissions partage (project_shares)

- `read` : lecture seule
- `write` : lecture + ecriture
- `admin` : lecture + ecriture + suppression + gestion partages

## Points d'attention

- Le frontend est un SPA sans react-router (navigation par state dans App.tsx)
- PostGIS est requis pour la recherche de comparables (ST_DWithin)
- Les fichiers uploades vont dans `backend/uploads/`
- Le soft delete utilise `deleted_at` (retention 15 jours)
- Les donnees DVF sont importees via `scripts/seed_comparable_pool.py`

## Pour plus de details

- Backend complet : `docs/backend/ARCHITECTURE.md`
- Tous les endpoints : `docs/backend/API.md`
- Modeles BDD : `docs/backend/MODELS.md`
- Frontend complet : `docs/frontend/ARCHITECTURE.md`
- Composants : `docs/frontend/COMPONENTS.md`
