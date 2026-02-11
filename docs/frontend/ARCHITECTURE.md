# Frontend - Architecture

## Vue d'ensemble

SPA React 18 + TypeScript construite avec Vite. Interface utilisateur avec Tailwind CSS v4 et composants shadcn/ui (Radix UI). Pas de routeur : la navigation est geree par un state `view` dans `App.tsx`.

## Stack technique

| Outil | Version | Role |
|-------|---------|------|
| React | 18.3.1 | Framework UI |
| TypeScript | (via Vite) | Typage statique |
| Vite | 6.3.5 | Build tool + dev server |
| Tailwind CSS | 4.1.12 | Utility-first CSS (plugin Vite) |
| shadcn/ui + Radix UI | - | Composants UI accessibles |
| Leaflet + react-leaflet | 1.9.4 / 4.2.1 | Cartes interactives |
| Recharts | 2.15.2 | Graphiques |
| react-hook-form | 7.55.0 | Gestion formulaires |
| sonner | 2.0.3 | Notifications toast |
| lucide-react | - | Icones |
| date-fns | - | Formatage dates |

## Arborescence

```
frontend/src/
├── main.tsx                      # Entry point (AuthProvider + Toaster)
├── index.css                     # Styles globaux + Tailwind
├── app/
│   ├── App.tsx                   # SPA root : state view + navigation
│   └── components/               # Tous les composants applicatifs
│       ├── Header.tsx            # Barre de navigation principale
│       ├── Dashboard.tsx         # Dashboard admin
│       ├── ProjectCreation.tsx   # Formulaire creation projet
│       ├── RecentProjects.tsx    # Liste projets recents (accueil)
│       ├── SearchResultsPage.tsx # Resultats de recherche
│       ├── TrashPage.tsx         # Corbeille
│       ├── ProfilePage.tsx       # Page profil utilisateur
│       ├── SettingsPage.tsx      # Page parametres
│       ├── OffersPanel.tsx       # Panneau lateral droit (indicateurs)
│       ├── MarketTrends.tsx      # Tendances marche par ville
│       ├── MarketIndicators.tsx  # Indicateurs de marche
│       ├── LoginModal.tsx        # Modal de connexion
│       ├── SignUpModal.tsx       # Modal inscription
│       ├── AddConsultantModal.tsx # Modal ajout consultant (admin)
│       ├── ShareModal.tsx        # Modal partage projet
│       ├── LogoutConfirmModal.tsx # Confirmation deconnexion
│       ├── CreateValueModal.tsx  # Modal creation avis de valeur
│       ├── ProfileDropdown.tsx   # Menu deroulant profil
│       ├── InboxDropdown.tsx     # Menu notifications
│       ├── AddressMap.tsx        # Carte adresse (Leaflet)
│       ├── EmptyState.tsx        # Composant etat vide
│       ├── ImageWithFallback.tsx # Image avec fallback
│       ├── filters/              # Composants de filtrage
│       │   ├── FiltersSidebar.tsx
│       │   ├── SearchBar.tsx
│       │   ├── SortDropdown.tsx
│       │   └── index.ts
│       └── evaluation/           # Workflow d'evaluation (5 etapes)
│           ├── EvaluationProcess.tsx  # Conteneur principal du workflow
│           ├── EvaluationTabs.tsx     # Onglets des 5 etapes
│           ├── ProgressBar.tsx        # Barre de progression
│           ├── InformationsStep.tsx   # Etape 1 : Informations
│           ├── ComparisonStep.tsx     # Etape 2 : Comparaison
│           ├── AnalysisStep.tsx       # Etape 3 : Analyse
│           ├── SimulationStep.tsx     # Etape 4 : Simulation
│           ├── FinalisationStep.tsx   # Etape 5 : Finalisation
│           ├── ComparisonTable.tsx    # Tableau comparatif
│           ├── ComparisonFilters.tsx  # Filtres de recherche comparables
│           ├── ComparisonValidation.tsx # Validation comparables
│           ├── ComparableMap.tsx      # Carte des comparables (Leaflet)
│           ├── ComparableMapLegend.tsx # Legende carte
│           ├── SelectedComparablesList.tsx # Liste selection
│           ├── PriceIndicators.tsx    # Indicateurs de prix
│           ├── AIAssistant.tsx        # Placeholder assistant IA
│           └── DocumentViewer.tsx     # Visionneuse documents
├── contexts/
│   └── AuthContext.tsx           # Contexte auth global (JWT + localStorage)
├── services/
│   ├── projectService.ts        # Client API projets, comparables, fichiers, partages
│   └── geocodingService.ts      # Geocodage Nominatim (OpenStreetMap)
├── hooks/
│   ├── useProjects.ts           # Fetching et cache projets
│   └── useProjectsFilters.ts    # Etat des filtres
├── types/
│   ├── project.ts               # Types Project, Filters, Sort, Pagination
│   └── comparable.ts            # Types ComparablePool, SelectedComparable, Filters
└── components/ui/               # Composants shadcn/ui (43+ fichiers)
    ├── button.tsx, input.tsx, card.tsx, dialog.tsx, ...
    └── utils.ts                 # cn() helper (clsx + tailwind-merge)
```

## Navigation (sans routeur)

La navigation est entierement geree par un state dans `App.tsx` :

```typescript
const [view, setView] = useState<
  "home" | "evaluation" | "dashboard" | "market-trends" |
  "search-results" | "trash" | "profile" | "settings"
>("home");
```

**Vues disponibles** :

| View | Composant principal | Description |
|------|-------------------|-------------|
| `home` | Header + ProjectCreation + RecentProjects + OffersPanel | Page d'accueil (layout 78/22) |
| `evaluation` | EvaluationProcess | Workflow 5 etapes |
| `dashboard` | Dashboard | Statistiques admin |
| `market-trends` | MarketTrends | Tendances par ville |
| `search-results` | SearchResultsPage | Resultats recherche |
| `trash` | TrashPage | Corbeille |
| `profile` | ProfilePage | Profil utilisateur |
| `settings` | SettingsPage | Parametres |

**Flux** :
- Non authentifie -> `LoginModal` (plein ecran)
- Loading auth -> Spinner
- Authentifie -> vue `home` par defaut

## Authentification (AuthContext)

`contexts/AuthContext.tsx` fournit un contexte React global :

```typescript
interface AuthContextType {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  currentUser: UserData | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}
```

**Fonctionnement** :
1. Au montage, verifie si un token existe dans `localStorage`
2. Si oui, appelle `GET /api/auth/me` pour valider le token
3. Si le token est invalide, supprime de localStorage et affiche le login
4. `login()` envoie un `POST /api/auth/login` (FormData), stocke le token
5. `logout()` supprime le token et reinitialise l'etat

**Usage** : `const { isAuthenticated, currentUser, login, logout } = useAuth();`

## Services API

### projectService.ts

Client API central. Gere toutes les communications avec le backend.

**Fonctions authentifiees (production)** :
- `getRecentProjectsAuth()` -> Liste projets
- `createProjectAuth(data)` -> Creation projet
- `getProjectByIdAuth(id)` -> Detail projet
- `deleteProjectAuth(id)` -> Soft delete
- `restoreProjectAuth(id)` -> Restauration
- `permanentDeleteProjectAuth(id)` -> Suppression definitive
- `getTrashProjectsAuth()` -> Projets en corbeille
- `validateComparables(projectId)` -> Validation etape 2
- `updateComparableAdjustment(projectId, comparableId, adjustment)` -> Ajustement

**Fonctions partage** :
- `getAvailableUsersForShare(projectId, search)` -> Utilisateurs disponibles
- `getProjectShares(projectId)` -> Liste partages
- `shareProject(projectId, data)` -> Creer partage
- `updateProjectShare(projectId, userId, permission)` -> Modifier permission
- `removeProjectShare(projectId, userId)` -> Supprimer partage

**Fonctions dev (sans auth)** :
- `getProjectsWithFilters(filters, sort, pagination)` -> Liste filtree
- `getFiltersMetadata()` -> Metadonnees filtres
- `searchComparables(projectId, filters)` -> Recherche comparables
- `getSelectedComparables(projectId)` -> Selection
- `selectComparable(projectId, poolId, adjustment)` -> Selectionner
- `deselectComparable(projectId, comparableId)` -> Deselectionner
- `savePropertyInfo(projectId, data)` -> Informations du bien
- `uploadProjectFile(projectId, file)` -> Upload fichier
- `getProjectFiles(projectId)` -> Liste fichiers
- `getFileUrl(projectId, fileId)` -> URL fichier
- `deleteProjectFile(projectId, fileId)` -> Suppression fichier

### geocodingService.ts

Geocodage via l'API Nominatim (OpenStreetMap) pour convertir adresses en coordonnees.

## Types TypeScript

### project.ts

Types alignes avec les schemas Pydantic du backend :
- `ProjectStatus` : `'draft' | 'in_progress' | 'completed' | 'archived'`
- `PropertyType` : `'office' | 'warehouse' | 'retail' | 'industrial' | 'land' | 'mixed'`
- `Project` : interface complete avec `user: UserBrief` et `property_info: PropertyInfoBrief`
- `ProjectFilters`, `ProjectSort`, `ProjectPagination` : parametres de requete
- `FiltersMetadata`, `ProjectsResponse` : reponses API paginee
- Constantes : `defaultFilters`, `defaultSort`, `defaultPagination`

### comparable.ts

- `ComparablePool` : bien du pool avec coordonnees et distance
- `SelectedComparable` : bien selectionne avec ajustement
- `PriceStats` : statistiques de prix (vente/location)
- `ComparableSearchResponse` : reponse recherche (comparables + stats + center)
- `ComparisonFilters` : filtres de recherche (surface, annee, distance, source)
- `DEFAULT_COMPARISON_FILTERS` : valeurs par defaut

## Workflow d'evaluation (5 etapes)

Le composant `EvaluationProcess` orchestre le workflow :

1. **Informations** (`InformationsStep`) : formulaire du bien, upload docs, carte, SWOT
2. **Comparaison** (`ComparisonStep`) : recherche PostGIS, carte Leaflet, selection (max 3), ajustements
3. **Analyse** (`AnalysisStep`) : indicateurs marche, graphiques Recharts
4. **Simulation** (`SimulationStep`) : calculatrices financieres (rendement, emprunt, reserve fonciere)
5. **Finalisation** (`FinalisationStep`) : selection sections, previsualisation, export PDF/DOCX/PPTX

Navigation par `EvaluationTabs` + `ProgressBar`. Passage a l'etape suivante controle (ex: validation des comparables requise pour etape 3).

## Layout de la page d'accueil

```
┌─────────────────────────────────────────────────┐
│                   Header                         │
├─────────────────────────────┬───────────────────┤
│      ProjectCreation        │                   │
│        (40vh)               │   OffersPanel     │
├─────────────────────────────┤    (22% width)    │
│      RecentProjects         │                   │
│        (flex-1)             │                   │
└─────────────────────────────┴───────────────────┘
         78% width
```

## Configuration

**vite.config.ts** :
- Plugin React (Babel)
- Plugin Tailwind CSS Vite
- Alias `@` -> `src/`

**API_BASE** : `http://localhost:8000` (configurable via `VITE_API_URL`)

**Docker** : service `oryem_frontend` sur port 5173, depend du backend.
