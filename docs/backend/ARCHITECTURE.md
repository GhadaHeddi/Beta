# Backend - Architecture

## Vue d'ensemble

Backend FastAPI servant une API REST sous le prefixe `/api`. PostgreSQL + PostGIS pour le stockage et les requetes geospatiales.

## Arborescence

```
backend/
├── app/
│   ├── main.py              # FastAPI app, CORS, routers
│   ├── config.py             # Pydantic BaseSettings (.env)
│   ├── database.py           # SQLAlchemy engine + session
│   ├── models/               # ORM SQLAlchemy
│   │   ├── __init__.py       # Exporte tous les modeles
│   │   ├── user.py           # User + UserRole enum
│   │   ├── project.py        # Project + ProjectStatus + PropertyType enums
│   │   ├── property_info.py  # PropertyInfo (1:1 avec Project)
│   │   ├── document.py       # Document + DocumentType enum
│   │   ├── comparable.py     # Comparable (selection par projet)
│   │   ├── comparable_pool.py # ComparablePool (pool central PostGIS)
│   │   ├── valuation.py      # Valuation + ValuationMethod enum
│   │   ├── dvf_record.py     # DVFRecord (donnees publiques)
│   │   ├── surface.py        # Surface + SurfaceType enum
│   │   ├── analysis_result.py # AnalysisResult (1:1 avec Project)
│   │   ├── simulation.py     # Simulation + SimulationType enum
│   │   ├── document_generation.py # DocumentGeneration + DocFormat enum
│   │   └── project_share.py  # ProjectShare + SharePermission enum
│   ├── schemas/              # Pydantic (validation entrees/sorties)
│   │   ├── user.py           # UserResponse, ConsultantCreate, LoginRequest, Token...
│   │   ├── project.py        # ProjectCreate/Update/Response, ShareCreate/Response...
│   │   └── property_info.py  # PropertyInfoUpdate/Response/Brief
│   ├── routers/              # Endpoints API
│   │   ├── auth.py           # /api/auth/* (login, me, change-password)
│   │   ├── admin.py          # /api/admin/* (consultants, dashboard)
│   │   ├── projects.py       # /api/projects/* (CRUD, property-info, files, shares)
│   │   └── comparables.py    # /api/projects/{id}/comparables/* (search, select, validate)
│   ├── services/             # Logique metier
│   │   ├── auth.py           # hash_password, verify_password, create/decode JWT
│   │   ├── user.py           # CRUD utilisateurs, gestion consultants
│   │   └── comparable_service.py # Recherche PostGIS, geocodage, stats, selection
│   └── utils/
│       └── security.py       # get_current_user, require_admin (dependencies FastAPI)
├── alembic/
│   ├── env.py                # Config migrations (importe tous les modeles)
│   └── versions/             # Fichiers de migration
├── scripts/
│   ├── seed_admin.py         # Creation admin initial
│   ├── seed_data.py          # Donnees de test (consultants + projets)
│   └── seed_comparable_pool.py # Pool de 50-70 comparables test
├── uploads/                  # Fichiers uploades (monte en volume Docker)
└── requirements.txt          # Dependances Python
```

## Configuration (config.py)

Variables d'environnement (fichier `.env`) :

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://...` | Connection PostgreSQL |
| `SECRET_KEY` | (a changer) | Cle secrete JWT |
| `ALGORITHM` | `HS256` | Algorithme JWT |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` (24h) | Duree token |
| `UPLOAD_DIR` | `uploads` | Repertoire fichiers |
| `MAX_UPLOAD_SIZE` | `10485760` (10 Mo) | Taille max upload |
| `ALLOWED_EXTENSIONS` | `.pdf,.jpg,.jpeg,.png,.docx,.xlsx` | Extensions autorisees |
| `DVF_DATA_PATH` | `data/dvf` | Chemin donnees DVF |
| `CORS_ORIGINS` | `localhost:3000,5173` | Origines autorisees |

## Flux d'authentification

```
1. POST /api/auth/login  (email + password)
2. Backend verifie email + bcrypt hash
3. Retourne JWT token (sub=user_id, exp=24h)
4. Frontend stocke token dans localStorage
5. Requetes suivantes : header Authorization: Bearer <token>
6. get_current_user() decode le JWT, charge le User depuis la BDD
7. require_admin() verifie user.role == ADMIN
```

## Systeme de permissions (projets)

Fonctions utilitaires dans `routers/projects.py` :

| Fonction | Qui a acces |
|----------|-------------|
| `can_access_project()` | Proprietaire, Admin de l'equipe, utilisateur avec un partage |
| `can_write_project()` | Proprietaire, Admin de l'equipe, partage `write` ou `admin` |
| `can_delete_project()` | Proprietaire, Admin de l'equipe, partage `admin` |
| `can_share_project()` | Proprietaire, Admin de l'equipe, partage `admin` |

## Service de comparables (comparable_service.py)

Logique de recherche spatiale :

1. Recupere les coordonnees du projet (geocodage Nominatim si besoin)
2. Requete PostGIS sur `comparable_pool` avec `ST_DWithin` (rayon en km)
3. Filtre par `property_type` (automatique depuis le projet)
4. Filtres optionnels : surface min/max, annee min/max, source
5. Calcul de distance Haversine pour chaque resultat
6. Calcul de statistiques (prix moyen vente/location au m2)
7. Selection : copie du comparable du pool vers la table `comparables` du projet
8. Ajustement : pourcentage de decote/surcote applique au prix/m2

## Dependances principales

- **FastAPI** 0.115.0 - Framework API
- **SQLAlchemy** 2.0.36 + **GeoAlchemy2** - ORM + PostGIS
- **Alembic** 1.14.0 - Migrations
- **python-jose** + **passlib** + **bcrypt** - Auth JWT
- **Pydantic** 2.10.3 - Validation
- **geopy** - Geocodage (Nominatim)
- **python-docx**, **python-pptx**, **reportlab** - Generation documents
- **pandas**, **numpy** - Traitement donnees
- **pytest** - Tests

## Docker

Service `oryem_backend` dans `docker-compose.yml` :
- Port : 8000
- Volumes : code source + uploads
- Depend de : PostgreSQL (postgis/postgis:16-3.4)
- Variables : DATABASE_URL, SECRET_KEY, ADMIN_EMAIL/PASSWORD
