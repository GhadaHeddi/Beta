# Schéma de Base de Données - Système d'Évaluation Immobilière

## Vue d'ensemble

Ce système de base de données PostgreSQL gère un **outil d'évaluation et d'expertise immobilière**. Il permet aux utilisateurs de créer des projets d'évaluation, de collecter des données comparables, d'effectuer des simulations financières et de générer des rapports d'expertise.

---

## Architecture Globale

```
USERS (utilisateurs)
  ↓
PROJECTS (projets d'évaluation)
  ↓
├─ PROPERTY_INFOS (informations détaillées du bien)
├─ COMPARABLES (comparables sélectionnés)
├─ VALUATIONS (évaluations par différentes méthodes)
├─ PROJECT_SURFACES (découpage surfaces)
├─ SIMULATIONS (simulations financières)
├─ DOCUMENTS (pièces jointes)
├─ DOCUMENT_GENERATIONS (rapports générés)
└─ PROJECT_SHARES (partages collaboratifs)

COMPARABLE_POOL (pool de comparables disponibles)
DVF_RECORDS (données DVF - transactions immobilières publiques)
SPATIAL_REF_SYS (système de références géographiques)
```

---

## Tables Principales

### 1. **USERS** - Utilisateurs
Gestion des comptes utilisateurs et des rôles.

```sql
CREATE TABLE users (
    id                 INTEGER PRIMARY KEY,
    email              VARCHAR NOT NULL,
    password_hash      VARCHAR NOT NULL,
    first_name         VARCHAR NOT NULL,
    last_name          VARCHAR NOT NULL,
    phone              VARCHAR,
    avatar_url         VARCHAR,
    role               USERROLE NOT NULL DEFAULT 'CONSULTANT',
    admin_id           INTEGER REFERENCES users(id),
    created_at         TIMESTAMP,
    updated_at         TIMESTAMP
);
```

**Caractéristiques :**
- Système de rôles avec ENUM `userrole` (ex: CONSULTANT, ADMIN)
- Hiérarchie via `admin_id` (relation auto-référentielle)
- Authentification par hash de mot de passe

---

### 2. **PROJECTS** - Projets d'évaluation
Projets d'expertise immobilière créés par les utilisateurs.

```sql
CREATE TABLE projects (
    id                 INTEGER PRIMARY KEY,
    user_id            INTEGER NOT NULL REFERENCES users(id),
    title              VARCHAR NOT NULL,
    address            VARCHAR NOT NULL,
    property_type      PROPERTYTYPE NOT NULL,
    status             PROJECTSTATUS,
    current_step       INTEGER,
    created_at         TIMESTAMP,
    updated_at         TIMESTAMP,
    deleted_at         TIMESTAMP
);
```

**Caractéristiques :**
- Soft delete via `deleted_at`
- Types de propriété (appartement, maison, immeuble, terrain, etc.)
- Suivi de l'avancement avec `current_step`
- Statut du projet (brouillon, en cours, terminé, etc.)

---

### 3. **PROPERTY_INFOS** - Informations détaillées du bien
Fiche technique et urbanisme du bien à évaluer.

```sql
CREATE TABLE property_infos (
    id                     INTEGER PRIMARY KEY,
    project_id             INTEGER NOT NULL REFERENCES projects(id),
    owner_name             VARCHAR,
    owner_contact          VARCHAR,
    occupant_name          VARCHAR,
    occupant_contact       VARCHAR,
    construction_year      INTEGER,
    materials              VARCHAR,
    total_surface          DOUBLE PRECISION,
    terrain_surface        DOUBLE PRECISION,
    number_of_floors       INTEGER,
    parking_spaces         INTEGER,
    latitude               DOUBLE PRECISION,
    longitude              DOUBLE PRECISION,
    postal_code            VARCHAR,
    city                   VARCHAR,
    geographic_sector      VARCHAR,
    plu_zone               VARCHAR,
    plu_regulation         TEXT,
    oap                    TEXT,
    servitudes             TEXT,
    flood_zones            TEXT,
    swot_strengths         TEXT,
    swot_weaknesses        TEXT,
    swot_opportunities     TEXT,
    swot_threats           TEXT,
    notes                  TEXT,
    created_at             TIMESTAMP,
    updated_at             TIMESTAMP
);
```

**Caractéristiques :**
- Données techniques du bien
- Informations urbanistiques (PLU, OAP, servitudes)
- Analyse SWOT intégrée
- Géolocalisation (latitude/longitude)

---

### 4. **COMPARABLES** - Comparables sélectionnés
Biens comparables sélectionnés et ajustés pour un projet spécifique.

```sql
CREATE TABLE comparables (
    id                        INTEGER PRIMARY KEY,
    project_id                INTEGER NOT NULL REFERENCES projects(id),
    address                   VARCHAR NOT NULL,
    postal_code               VARCHAR,
    city                      VARCHAR,
    surface                   DOUBLE PRECISION NOT NULL,
    price                     DOUBLE PRECISION NOT NULL,
    price_per_m2              DOUBLE PRECISION NOT NULL,
    distance                  DOUBLE PRECISION,
    latitude                  DOUBLE PRECISION,
    longitude                 DOUBLE PRECISION,
    transaction_date          DATE,
    construction_year         INTEGER,
    adjustment                DOUBLE PRECISION,
    adjusted_price_per_m2     DOUBLE PRECISION,
    validated                 BOOLEAN,
    validation_notes          VARCHAR,
    source                    VARCHAR,
    source_reference          VARCHAR,
    created_at                TIMESTAMP,
    updated_at                TIMESTAMP
);
```

**Caractéristiques :**
- Prix au m² brut et ajusté
- Calcul de distance par rapport au projet
- Validation manuelle par l'expert
- Traçabilité de la source

---

### 5. **COMPARABLE_POOL** - Pool de comparables
Base de données centrale de transactions immobilières disponibles.

```sql
CREATE TABLE comparable_pool (
    id                    INTEGER PRIMARY KEY,
    address               VARCHAR NOT NULL,
    postal_code           VARCHAR,
    city                  VARCHAR,
    latitude              DOUBLE PRECISION NOT NULL,
    longitude             DOUBLE PRECISION NOT NULL,
    property_type         VARCHAR NOT NULL,
    surface               DOUBLE PRECISION NOT NULL,
    construction_year     INTEGER,
    transaction_type      TRANSACTIONTYPE NOT NULL,
    price                 DOUBLE PRECISION NOT NULL,
    price_per_m2          DOUBLE PRECISION NOT NULL,
    transaction_date      DATE NOT NULL,
    source                COMPARABLESOURCE NOT NULL,
    source_reference      VARCHAR,
    photo_url             VARCHAR,
    geom                  GEOMETRY(Point, 4326),
    created_at            TIMESTAMP,
    updated_at            TIMESTAMP
);
```

**Caractéristiques :**
- Base centrale alimentée par diverses sources
- Types de transaction (vente, location)
- Géométrie PostGIS pour recherches spatiales
- Sources multiples (DVF, agences, etc.)

---

### 6. **DVF_RECORDS** - Données DVF
Import des données publiques DVF (Demandes de Valeurs Foncières).

```sql
CREATE TABLE dvf_records (
    id                          INTEGER PRIMARY KEY,
    mutation_id                 VARCHAR,
    mutation_date               DATE NOT NULL,
    nature_mutation             VARCHAR,
    valeur_fonciere             DOUBLE PRECISION,
    adresse                     VARCHAR,
    code_postal                 VARCHAR,
    commune                     VARCHAR,
    code_commune                VARCHAR,
    departement                 VARCHAR,
    type_local                  VARCHAR,
    code_type_local             VARCHAR,
    surface_reelle_bati         DOUBLE PRECISION,
    surface_terrain             DOUBLE PRECISION,
    nombre_pieces_principales   INTEGER,
    latitude                    DOUBLE PRECISION,
    longitude                   DOUBLE PRECISION,
    geom                        GEOGRAPHY(Point, 4326),
    numero_disposition          VARCHAR
);
```

**Caractéristiques :**
- Données publiques officielles françaises
- Transactions immobilières réelles
- Géographie PostGIS pour analyses spatiales

---

### 7. **VALUATIONS** - Évaluations
Différentes méthodes d'évaluation appliquées au projet.

```sql
CREATE TABLE valuations (
    id              INTEGER PRIMARY KEY,
    project_id      INTEGER NOT NULL REFERENCES projects(id),
    method          VALUATIONMETHOD NOT NULL,
    value           DOUBLE PRECISION NOT NULL,
    weight          DOUBLE PRECISION,
    parameters      JSON,
    notes           VARCHAR,
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP
);
```

**Caractéristiques :**
- Méthodes multiples (comparaison, rendement, DRC, etc.)
- Pondération pour synthèse finale
- Paramètres flexibles en JSON
- Plusieurs évaluations possibles par projet

**Méthodes d'évaluation typiques :**
- Méthode par comparaison
- Méthode par le rendement
- Coût de remplacement déprécié (DRC)
- Méthode du promoteur

---

### 8. **PROJECT_SURFACES** - Découpage des surfaces
Décomposition détaillée des surfaces par niveau et type.

```sql
CREATE TABLE project_surfaces (
    id                      INTEGER PRIMARY KEY,
    project_id              INTEGER NOT NULL REFERENCES projects(id),
    level                   VARCHAR NOT NULL,
    surface_type            SURFACETYPE NOT NULL,
    area_sqm                DOUBLE PRECISION NOT NULL,
    rental_value_per_sqm    DOUBLE PRECISION,
    weighting               DOUBLE PRECISION DEFAULT 1.0,
    notes                   VARCHAR,
    created_at              TIMESTAMP DEFAULT NOW(),
    updated_at              TIMESTAMP DEFAULT NOW()
);
```

**Caractéristiques :**
- Découpage par étage/niveau
- Types de surfaces (habitable, commerciale, parking, cave, etc.)
- Valeur locative par m² pour calculs de rendement
- Coefficients de pondération

---

### 9. **SIMULATIONS** - Simulations financières
Scénarios et calculs financiers liés au projet.

```sql
CREATE TABLE simulations (
    id                  INTEGER PRIMARY KEY,
    project_id          INTEGER NOT NULL REFERENCES projects(id),
    simulation_type     SIMULATIONTYPE NOT NULL,
    name                VARCHAR NOT NULL,
    input_data          JSON NOT NULL,
    output_data         JSON,
    notes               VARCHAR,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);
```

**Caractéristiques :**
- Types variés (investissement, crédit, rentabilité, etc.)
- Données flexibles en JSON
- Résultats calculés stockés

---

### 10. **DOCUMENTS** - Pièces jointes
Documents téléchargés liés aux projets.

```sql
CREATE TABLE documents (
    id              INTEGER PRIMARY KEY,
    project_id      INTEGER NOT NULL REFERENCES projects(id),
    name            VARCHAR NOT NULL,
    file_path       VARCHAR NOT NULL,
    file_type       DOCUMENTTYPE NOT NULL,
    mime_type       VARCHAR,
    size            INTEGER,
    description     VARCHAR,
    uploaded_at     TIMESTAMP
);
```

**Caractéristiques :**
- Types de documents (photos, plans, actes, diagnostics, etc.)
- Stockage du chemin fichier
- Métadonnées complètes

---

### 11. **DOCUMENT_GENERATIONS** - Rapports générés
Historique des rapports d'expertise générés.

```sql
CREATE TABLE document_generations (
    id                      INTEGER PRIMARY KEY,
    project_id              INTEGER NOT NULL REFERENCES projects(id),
    doc_format              DOCFORMAT NOT NULL,
    template_name           VARCHAR,
    retained_value          DOUBLE PRECISION,
    retained_yield_rate     DOUBLE PRECISION,
    included_sections       JSON,
    file_path               VARCHAR,
    generated_at            TIMESTAMP,
    created_at              TIMESTAMP DEFAULT NOW(),
    updated_at              TIMESTAMP DEFAULT NOW()
);
```

**Caractéristiques :**
- Formats multiples (PDF, DOCX, etc.)
- Templates personnalisables
- Valeurs retenues figées
- Sections configurables

---

### 12. **PROJECT_SHARES** - Partages collaboratifs
Gestion des droits d'accès aux projets.

```sql
CREATE TABLE project_shares (
    id              INTEGER PRIMARY KEY,
    project_id      INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    can_write       BOOLEAN,
    permission      SHAREPERMISSION NOT NULL DEFAULT 'write',
    created_at      TIMESTAMP
);
```

**Caractéristiques :**
- Partage entre utilisateurs
- Permissions granulaires (lecture/écriture)
- Cascade delete pour nettoyage automatique

---

### 13. **SPATIAL_REF_SYS** - Système de référence spatiale
Table PostGIS standard pour les systèmes de coordonnées.

```sql
CREATE TABLE spatial_ref_sys (
    srid        INTEGER PRIMARY KEY,
    auth_name   VARCHAR(256),
    auth_srid   INTEGER,
    srtext      VARCHAR(2048),
    proj4text   VARCHAR(2048)
);
```

**Caractéristiques :**
- Table système PostGIS
- Gère les projections géographiques
- SRID 4326 = WGS84 (GPS standard)

---

## Types ENUM Utilisés

D'après l'analyse des tables, le système utilise les types énumérés suivants :

- **userrole** : Rôles des utilisateurs (CONSULTANT, ADMIN, etc.)
- **propertytype** : Types de propriété (appartement, maison, immeuble, terrain, etc.)
- **projectstatus** : Statuts de projet (draft, in_progress, completed, etc.)
- **transactiontype** : Types de transaction (vente, location)
- **comparablesource** : Sources de comparables (DVF, agence, notaire, etc.)
- **valuationmethod** : Méthodes d'évaluation (comparison, yield, cost, developer, etc.)
- **surfacetype** : Types de surface (habitable, commerciale, parking, cave, jardin, etc.)
- **simulationtype** : Types de simulation (investment, loan, profitability, etc.)
- **documenttype** : Types de documents (photo, plan, deed, diagnostic, etc.)
- **docformat** : Formats de documents générés (PDF, DOCX, etc.)
- **sharepermission** : Permissions de partage (read, write, admin)

---

## Relations Clés

### Hiérarchie principale
```
users (1) ──┬──> (n) projects
            │
            └──> (n) users (admin_id)

projects (1) ──┬──> (n) property_infos
               ├──> (n) comparables
               ├──> (n) valuations
               ├──> (n) project_surfaces
               ├──> (n) simulations
               ├──> (n) documents
               ├──> (n) document_generations
               └──> (n) project_shares
```

### Relations de partage
```
project_shares (n) ──> (1) projects [ON DELETE CASCADE]
project_shares (n) ──> (1) users [ON DELETE CASCADE]
```

### Données de référence
```
comparable_pool : Base centrale de transactions
dvf_records : Import données publiques DVF
```

---

## Fonctionnalités Géospatiales

Le système utilise **PostGIS** pour :

1. **Stockage de coordonnées GPS**
   - Colonnes `latitude` / `longitude` dans plusieurs tables
   - Colonnes `geom` (GEOMETRY) et `geography` (GEOGRAPHY)

2. **Recherches spatiales**
   - Calcul de distance entre biens
   - Recherche de comparables dans un rayon
   - Analyse de zonage

3. **Projections**
   - SRID 4326 (WGS84) - standard GPS mondial
   - Table `spatial_ref_sys` pour conversions

---

## Workflow Typique

1. **Création de projet**
   - L'utilisateur crée un `project`
   - Saisie des `property_infos` du bien à évaluer

2. **Recherche de comparables**
   - Requête dans `comparable_pool` ou `dvf_records`
   - Sélection et ajustement dans `comparables`

3. **Découpage des surfaces**
   - Remplissage de `project_surfaces` par niveau

4. **Évaluation**
   - Application de plusieurs méthodes dans `valuations`
   - Simulations financières dans `simulations`

5. **Documentation**
   - Upload de pièces jointes dans `documents`
   - Génération de rapport dans `document_generations`

6. **Collaboration**
   - Partage via `project_shares`

---

## Points d'Attention Techniques

### Performance
- Index sur `deleted_at` pour soft-delete performant
- Index géospatiaux sur colonnes `geom`
- Index sur foreign keys pour les jointures

### Sécurité
- Mots de passe hashés (jamais en clair)
- Système de permissions granulaires
- Cascade delete pour éviter les orphelins

### Flexibilité
- Champs JSON pour données variables
- Types ENUM pour contraintes métier
- Soft delete pour historique

### Intégrité
- Foreign keys avec contraintes
- NOT NULL sur champs obligatoires
- Timestamps pour audit trail

---

## Technologies Utilisées

- **PostgreSQL 16.4** - SGBD relationnel
- **PostGIS** - Extension géospatiale
- **JSON** - Stockage de données flexibles
- **Sequences** - Auto-incrémentation des IDs

---

## Résumé

Ce schéma de base de données supporte un **outil professionnel d'expertise immobilière** permettant de :

✅ Gérer des projets d'évaluation multi-utilisateurs  
✅ Collecter et analyser des données comparables  
✅ Appliquer différentes méthodes d'évaluation  
✅ Effectuer des simulations financières  
✅ Générer des rapports d'expertise professionnels  
✅ Collaborer sur les dossiers  
✅ Exploiter des données géospatiales (distances, cartographie)

Le système est conçu pour être **flexible** (JSON), **performant** (indexes, PostGIS), **sécurisé** (permissions, hashing) et **auditable** (timestamps, soft-delete).