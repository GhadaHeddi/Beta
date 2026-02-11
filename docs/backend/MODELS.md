# Backend - Modeles SQLAlchemy et Enums

13 modeles SQLAlchemy definis dans `backend/app/models/`. ORM SQLAlchemy 2.0 avec GeoAlchemy2 pour les colonnes PostGIS.

---

## Enumerations

### UserRole

```python
class UserRole(str, Enum):
    ADMIN = "admin"
    CONSULTANT = "consultant"
```

### ProjectStatus

```python
class ProjectStatus(str, Enum):
    DRAFT = "draft"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ARCHIVED = "archived"
```

### PropertyType

```python
class PropertyType(str, Enum):
    OFFICE = "office"          # Bureau
    WAREHOUSE = "warehouse"    # Entrepot
    RETAIL = "retail"          # Commerce
    INDUSTRIAL = "industrial"  # Local d'activite
    LAND = "land"              # Terrain
    MIXED = "mixed"            # Mixte
```

### TransactionType

```python
class TransactionType(str, Enum):
    SALE = "sale"    # Vente
    RENT = "rent"    # Location
```

### ComparableSource

```python
class ComparableSource(str, Enum):
    ARTHUR_LOYD = "arthur_loyd"    # Base interne
    CONCURRENCE = "concurrence"    # DVF, SeLoger, etc.
```

### ValuationMethod

```python
class ValuationMethod(str, Enum):
    COMPARISON = "comparison"    # Par comparaison
    YIELD = "yield"              # Par rendement
    COST = "cost"                # Cout de remplacement deprecie (DRC)
    DEVELOPER = "developer"      # Methode promoteur
```

### SurfaceType

```python
class SurfaceType(str, Enum):
    OFFICE = "office"
    WAREHOUSE = "warehouse"
    RETAIL = "retail"
    PARKING = "parking"
    ARCHIVE = "archive"
    COMMON = "common"
    TECHNICAL = "technical"
    OTHER = "other"
```

### SimulationType

```python
class SimulationType(str, Enum):
    INVESTMENT = "investment"
    LOAN = "loan"
    PROFITABILITY = "profitability"
    LAND_RESERVE = "land_reserve"
```

### DocumentType

```python
class DocumentType(str, Enum):
    PHOTO = "photo"
    PLAN = "plan"
    DEED = "deed"
    DIAGNOSTIC = "diagnostic"
    OTHER = "other"
```

### DocFormat

```python
class DocFormat(str, Enum):
    PDF = "pdf"
    DOCX = "docx"
    PPTX = "pptx"
```

### SharePermission

```python
class SharePermission(str, Enum):
    READ = "read"
    WRITE = "write"
    ADMIN = "admin"
```

---

## Modeles

### User (`models/user.py`)

Table : `users`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | Integer | PK, index | ID auto-incremente |
| `email` | String | unique, index, NOT NULL | Email de connexion |
| `password_hash` | String | NOT NULL | Hash bcrypt du mot de passe |
| `first_name` | String | NOT NULL | Prenom |
| `last_name` | String | NOT NULL | Nom |
| `phone` | String | nullable | Telephone |
| `avatar_url` | String | nullable | URL avatar |
| `role` | UserRole | NOT NULL, default CONSULTANT | Role utilisateur |
| `admin_id` | Integer | FK users.id, nullable | Admin de rattachement (consultants) |
| `created_at` | DateTime | default utcnow | Date creation |
| `updated_at` | DateTime | default utcnow, onupdate | Date modification |

**Relations** :
- `projects` -> Project (1:N, cascade delete)
- `admin` -> User (N:1 auto-referentiel via admin_id)
- `consultants` -> User (1:N backref via admin_id)
- `shared_projects` -> ProjectShare (1:N, cascade delete)

**Propriete** : `is_admin` -> `bool`

---

### Project (`models/project.py`)

Table : `projects`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | Integer | PK, index | ID |
| `user_id` | Integer | FK users.id, NOT NULL | Proprietaire |
| `title` | String | NOT NULL | Titre du projet |
| `address` | String | NOT NULL | Adresse du bien |
| `property_type` | PropertyType | NOT NULL | Type de bien |
| `status` | ProjectStatus | default DRAFT | Statut |
| `current_step` | Integer | default 1 | Etape actuelle (1 a 5) |
| `created_at` | DateTime | default utcnow | Date creation |
| `updated_at` | DateTime | default utcnow, onupdate | Date modification |
| `deleted_at` | DateTime | nullable, default None | Soft delete (corbeille) |

**Relations** (toutes avec cascade `all, delete-orphan`) :
- `user` -> User (N:1)
- `property_info` -> PropertyInfo (1:1, uselist=False)
- `documents` -> Document (1:N)
- `comparables` -> Comparable (1:N)
- `valuations` -> Valuation (1:N)
- `shares` -> ProjectShare (1:N)
- `surfaces` -> Surface (1:N)
- `analysis_result` -> AnalysisResult (1:1, uselist=False)
- `simulations` -> Simulation (1:N)
- `document_generations` -> DocumentGeneration (1:N)

---

### PropertyInfo (`models/property_info.py`)

Table : `property_infos` - Relation 1:1 avec Project.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | Integer | PK |
| `project_id` | Integer | FK projects.id, NOT NULL |
| `owner_name` | String | Nom proprietaire |
| `owner_contact` | String | Contact proprietaire |
| `occupant_name` | String | Nom occupant |
| `occupant_contact` | String | Contact occupant |
| `construction_year` | Integer | Annee de construction |
| `materials` | String | Materiaux de construction |
| `total_surface` | Float | Surface totale (m2) |
| `terrain_surface` | Float | Surface terrain (m2) |
| `number_of_floors` | Integer | Nombre d'etages |
| `parking_spaces` | Integer | Places de parking |
| `latitude` | Float | Latitude GPS |
| `longitude` | Float | Longitude GPS |
| `postal_code` | String | Code postal |
| `city` | String | Ville |
| `geographic_sector` | String | Secteur geographique |
| `plu_zone` | String | Zone PLU |
| `plu_regulation` | Text | Reglement PLU |
| `oap` | Text | Orientations d'Amenagement |
| `servitudes` | Text | Servitudes |
| `flood_zones` | Text | Zones inondables |
| `swot_strengths` | Text | Forces (SWOT) |
| `swot_weaknesses` | Text | Faiblesses (SWOT) |
| `swot_opportunities` | Text | Opportunites (SWOT) |
| `swot_threats` | Text | Menaces (SWOT) |
| `notes` | Text | Notes libres |
| `created_at` / `updated_at` | DateTime | Metadonnees |

---

### Comparable (`models/comparable.py`)

Table : `comparables` - Comparables selectionnes pour un projet.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | Integer | PK |
| `project_id` | Integer | FK projects.id, NOT NULL |
| `address` | String | NOT NULL |
| `postal_code` | String | Code postal |
| `city` | String | Ville |
| `surface` | Float | NOT NULL, surface m2 |
| `price` | Float | NOT NULL, prix total |
| `price_per_m2` | Float | NOT NULL |
| `distance` | Float | Distance au bien evalue (km) |
| `latitude` / `longitude` | Float | Coordonnees |
| `transaction_date` | Date | Date transaction |
| `construction_year` | Integer | Annee construction |
| `adjustment` | Float | Ajustement en % (decote/surcote) |
| `adjusted_price_per_m2` | Float | Prix ajuste au m2 |
| `validated` | Boolean | Valide par l'expert |
| `validation_notes` | String | Notes de validation |
| `source` | String | Source (arthur_loyd, concurrence) |
| `source_reference` | String | Reference externe |

---

### ComparablePool (`models/comparable_pool.py`)

Table : `comparable_pool` - Pool central de reference avec PostGIS.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | Integer | PK |
| `address` | String | NOT NULL |
| `postal_code` | String | index |
| `city` | String | index |
| `latitude` / `longitude` | Float | NOT NULL |
| `geom` | Geometry(Point, 4326) | Colonne PostGIS pour requetes spatiales |
| `property_type` | String | index, NOT NULL |
| `surface` | Float | NOT NULL (m2) |
| `construction_year` | Integer | Annee construction |
| `transaction_type` | TransactionType | NOT NULL (sale/rent) |
| `price` | Float | NOT NULL (prix total ou loyer annuel) |
| `price_per_m2` | Float | NOT NULL |
| `transaction_date` | Date | NOT NULL, index |
| `source` | ComparableSource | NOT NULL, index |
| `source_reference` | String | Reference externe |
| `photo_url` | String | Photo du bien |

**Index PostGIS** : `idx_comparable_pool_geom` (GIST) pour optimiser `ST_DWithin`.
**Index composites** : type+source pour les recherches filtrees.

---

### DVFRecord (`models/dvf_record.py`)

Table : `dvf_records` - Donnees publiques DVF (Demandes de Valeurs Foncieres).

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | Integer | PK |
| `mutation_id` | String | ID mutation DVF |
| `mutation_date` | Date | NOT NULL |
| `nature_mutation` | String | Type (vente, echange...) |
| `valeur_fonciere` | Float | Montant transaction |
| `adresse` | String | Adresse du bien |
| `code_postal` | String | Code postal |
| `commune` | String | Commune |
| `code_commune` | String | Code INSEE |
| `departement` | String | Departement |
| `type_local` | String | Type de local |
| `code_type_local` | String | Code type |
| `surface_reelle_bati` | Float | Surface batie |
| `surface_terrain` | Float | Surface terrain |
| `nombre_pieces_principales` | Integer | Nombre pieces |
| `latitude` / `longitude` | Float | Coordonnees |
| `geom` | Geography(Point, 4326) | Colonne PostGIS |
| `numero_disposition` | String | Numero disposition |

---

### Valuation (`models/valuation.py`)

Table : `valuations` - Evaluations par methode.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | Integer | PK |
| `project_id` | Integer | FK, NOT NULL |
| `method` | ValuationMethod | NOT NULL |
| `value` | Float | NOT NULL, valeur estimee |
| `weight` | Float | Ponderation (0 a 1) |
| `parameters` | JSON | Parametres de calcul (flexibles) |
| `notes` | String | Notes |

---

### Surface (`models/surface.py`)

Table : `project_surfaces` - Decoupage surfaces par niveau.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | Integer | PK |
| `project_id` | Integer | FK, NOT NULL |
| `level` | String | NOT NULL (ex: "RDC", "R+1") |
| `surface_type` | SurfaceType | NOT NULL |
| `area_sqm` | Float | NOT NULL, surface en m2 |
| `rental_value_per_sqm` | Float | Valeur locative au m2 |
| `weighting` | Float | default 1.0, coefficient ponderation |
| `notes` | String | Notes |

---

### AnalysisResult (`models/analysis_result.py`)

Table : `analysis_results` - Resultats agreges, relation 1:1 avec Project.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | Integer | PK |
| `project_id` | Integer | FK, unique, NOT NULL |
| `avg_price_per_m2` | Float | Prix moyen au m2 |
| `median_price_per_m2` | Float | Prix median au m2 |
| `avg_rent_per_m2` | Float | Loyer moyen au m2 |
| `avg_yield_rate` | Float | Taux rendement moyen |
| `estimated_value` | Float | Valeur estimee finale |
| `confidence_score` | Float | Score de confiance (0-1) |
| `market_data` | JSON | Donnees marche brutes |
| `methodology_notes` | Text | Notes methodologie |

---

### Simulation (`models/simulation.py`)

Table : `simulations` - Simulations financieres.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | Integer | PK |
| `project_id` | Integer | FK, NOT NULL |
| `simulation_type` | SimulationType | NOT NULL |
| `name` | String | NOT NULL |
| `input_data` | JSON | NOT NULL, parametres d'entree |
| `output_data` | JSON | Resultats calcules |
| `notes` | String | Notes |

---

### Document (`models/document.py`)

Table : `documents` - Fichiers uploades.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | Integer | PK |
| `project_id` | Integer | FK, NOT NULL |
| `name` | String | NOT NULL, nom fichier |
| `file_path` | String | NOT NULL, chemin physique |
| `file_type` | DocumentType | NOT NULL |
| `mime_type` | String | Type MIME |
| `size` | Integer | Taille en octets |
| `description` | String | Description |
| `uploaded_at` | DateTime | Date upload |

---

### DocumentGeneration (`models/document_generation.py`)

Table : `document_generations` - Rapports generes.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | Integer | PK |
| `project_id` | Integer | FK, NOT NULL |
| `doc_format` | DocFormat | NOT NULL (PDF, DOCX, PPTX) |
| `template_name` | String | Nom template |
| `retained_value` | Float | Valeur retenue |
| `retained_yield_rate` | Float | Taux rendement retenu |
| `included_sections` | JSON | Sections incluses |
| `file_path` | String | Chemin fichier genere |
| `generated_at` | DateTime | Date generation |

---

### ProjectShare (`models/project_share.py`)

Table : `project_shares` - Table de jointure N:N users-projects.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | Integer | PK | ID |
| `project_id` | Integer | FK projects.id, ON DELETE CASCADE | Projet partage |
| `user_id` | Integer | FK users.id, ON DELETE CASCADE | Destinataire |
| `can_write` | Boolean | deprecated | Ancien champ (utiliser permission) |
| `permission` | SharePermission | NOT NULL, default write | Niveau d'acces |
| `created_at` | DateTime | | Date creation |

---

## Diagramme de relations

```
User (1) ──> (N) Project ──┬── (1) PropertyInfo
  |                         ├── (N) Document
  |                         ├── (N) Comparable
  |                         ├── (N) Valuation
  |                         ├── (N) Surface
  |                         ├── (1) AnalysisResult
  |                         ├── (N) Simulation
  |                         ├── (N) DocumentGeneration
  |                         └── (N) ProjectShare ──> (1) User
  |
  └── (N) User (admin_id, auto-referentiel)

ComparablePool (independant, PostGIS)
DVFRecord (independant, PostGIS)
```

## Migrations Alembic

7 fichiers de migration dans `backend/alembic/versions/` :

1. `20260204_1528` - Schema initial (users, projects, property_infos, documents, comparables, valuations, dvf_records)
2. `20260204_1552` - Roles utilisateur et partage de projets (user_role, project_shares)
3. `20260205_1000` - Soft delete (deleted_at sur projects)
4. `20260205_1500` - Permission de partage (enum SharePermission)
5. `20260209_1600` - Pool de comparables (comparable_pool + PostGIS + index)
6. `20260210_1100` - Ajout construction_year aux comparables
7. `20260210` - Tables de detail (surfaces, analysis_results, simulations, document_generations)
