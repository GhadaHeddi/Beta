# Frontend - Inventaire des composants

## Composants applicatifs

### Pages et vues principales

| Composant | Fichier | Description |
|-----------|---------|-------------|
| `App` | `app/App.tsx` | SPA root, gestion des vues par state |
| `Dashboard` | `app/components/Dashboard.tsx` | Dashboard administrateur avec statistiques |
| `RecentProjects` | `app/components/RecentProjects.tsx` | Liste des projets recents (page d'accueil) |
| `SearchResultsPage` | `app/components/SearchResultsPage.tsx` | Resultats de recherche projets |
| `TrashPage` | `app/components/TrashPage.tsx` | Corbeille (soft delete, restauration, suppression definitive) |
| `ProfilePage` | `app/components/ProfilePage.tsx` | Page profil utilisateur (modification infos) |
| `SettingsPage` | `app/components/SettingsPage.tsx` | Page parametres |
| `MarketTrends` | `app/components/MarketTrends.tsx` | Tendances de marche par ville |

### Navigation et layout

| Composant | Fichier | Description |
|-----------|---------|-------------|
| `Header` | `app/components/Header.tsx` | Barre de navigation avec recherche, logo, actions |
| `ProfileDropdown` | `app/components/ProfileDropdown.tsx` | Menu deroulant profil utilisateur |
| `InboxDropdown` | `app/components/InboxDropdown.tsx` | Menu deroulant notifications |
| `OffersPanel` | `app/components/OffersPanel.tsx` | Panneau lateral droit (indicateurs marche) |

### Creation de projets

| Composant | Fichier | Description |
|-----------|---------|-------------|
| `ProjectCreation` | `app/components/ProjectCreation.tsx` | Zone de creation d'un nouveau projet (accueil) |
| `CreateValueModal` | `app/components/CreateValueModal.tsx` | Modal de creation d'avis de valeur |

### Authentification

| Composant | Fichier | Description |
|-----------|---------|-------------|
| `LoginModal` | `app/components/LoginModal.tsx` | Modal de connexion (plein ecran si non auth) |
| `SignUpModal` | `app/components/SignUpModal.tsx` | Modal d'inscription |
| `LogoutConfirmModal` | `app/components/LogoutConfirmModal.tsx` | Confirmation de deconnexion |

### Administration

| Composant | Fichier | Description |
|-----------|---------|-------------|
| `AddConsultantModal` | `app/components/AddConsultantModal.tsx` | Modal ajout consultant (admin) |
| `ShareModal` | `app/components/ShareModal.tsx` | Modal partage projet (recherche utilisateurs, permissions) |

### Composants utilitaires

| Composant | Fichier | Description |
|-----------|---------|-------------|
| `AddressMap` | `app/components/AddressMap.tsx` | Carte Leaflet pour localisation d'adresse |
| `MarketIndicators` | `app/components/MarketIndicators.tsx` | Indicateurs de marche immobilier |
| `EmptyState` | `app/components/EmptyState.tsx` | Composant pour etats vides |
| `ImageWithFallback` | `app/components/ImageWithFallback.tsx` | Image avec gestion du fallback |

### Filtres et recherche

| Composant | Fichier | Description |
|-----------|---------|-------------|
| `FiltersSidebar` | `app/components/filters/FiltersSidebar.tsx` | Barre laterale de filtres (types, ville, consultant, annee) |
| `SearchBar` | `app/components/filters/SearchBar.tsx` | Barre de recherche textuelle |
| `SortDropdown` | `app/components/filters/SortDropdown.tsx` | Menu de tri (date, titre, annee) |

---

## Workflow d'evaluation (5 etapes)

### Conteneur

| Composant | Fichier | Description |
|-----------|---------|-------------|
| `EvaluationProcess` | `evaluation/EvaluationProcess.tsx` | Orchestrateur du workflow, gestion etape courante |
| `EvaluationTabs` | `evaluation/EvaluationTabs.tsx` | Onglets des 5 etapes avec etat actif/complete |
| `ProgressBar` | `evaluation/ProgressBar.tsx` | Barre de progression visuelle |

### Etape 1 - Informations

| Composant | Fichier | Description |
|-----------|---------|-------------|
| `InformationsStep` | `evaluation/InformationsStep.tsx` | Formulaire complet : titre, adresse, type, proprietaire, occupant, caracteristiques, SWOT, upload documents, carte, notes |

### Etape 2 - Comparaison

| Composant | Fichier | Description |
|-----------|---------|-------------|
| `ComparisonStep` | `evaluation/ComparisonStep.tsx` | Conteneur de l'etape comparaison |
| `ComparisonFilters` | `evaluation/ComparisonFilters.tsx` | Filtres : surface min/max, annee min/max, rayon km, source |
| `ComparisonTable` | `evaluation/ComparisonTable.tsx` | Tableau des biens comparables trouves |
| `ComparableMap` | `evaluation/ComparableMap.tsx` | Carte Leaflet des comparables avec marqueurs |
| `ComparableMapLegend` | `evaluation/ComparableMapLegend.tsx` | Legende de la carte |
| `SelectedComparablesList` | `evaluation/SelectedComparablesList.tsx` | Liste des comparables selectionnes (max 3) avec ajustements |
| `PriceIndicators` | `evaluation/PriceIndicators.tsx` | Indicateurs de prix (moyenne vente/location, dernier prix) |
| `ComparisonValidation` | `evaluation/ComparisonValidation.tsx` | Bouton validation pour passer a l'etape 3 |

### Etape 3 - Analyse

| Composant | Fichier | Description |
|-----------|---------|-------------|
| `AnalysisStep` | `evaluation/AnalysisStep.tsx` | Indicateurs de marche, graphiques d'evolution, donnees secteur |

### Etape 4 - Simulation

| Composant | Fichier | Description |
|-----------|---------|-------------|
| `SimulationStep` | `evaluation/SimulationStep.tsx` | Calculatrices financieres : rendement, emprunt, frais notaire, reserve fonciere |

### Etape 5 - Finalisation

| Composant | Fichier | Description |
|-----------|---------|-------------|
| `FinalisationStep` | `evaluation/FinalisationStep.tsx` | Selection sections rapport, previsualisation, parametres export |

### Composants transversaux du workflow

| Composant | Fichier | Description |
|-----------|---------|-------------|
| `AIAssistant` | `evaluation/AIAssistant.tsx` | Placeholder pour futur assistant IA conversationnel |
| `DocumentViewer` | `evaluation/DocumentViewer.tsx` | Visionneuse de documents uploades |

---

## Composants UI (shadcn/ui)

43+ composants dans `src/components/ui/`, bases sur Radix UI. Style via Tailwind CSS.

### Inputs et formulaires

| Composant | Description |
|-----------|-------------|
| `Button` | Bouton avec variantes (default, destructive, outline, secondary, ghost, link) |
| `Input` | Champ texte |
| `Textarea` | Zone de texte multiligne |
| `Checkbox` | Case a cocher |
| `RadioGroup` | Groupe de boutons radio |
| `Select` | Liste deroulante |
| `Switch` | Toggle on/off |
| `Slider` | Curseur de valeur |
| `Calendar` | Calendrier pour selection de date |
| `Form` | Integration react-hook-form |
| `Label` | Label de formulaire |
| `InputOTP` | Champ de saisie OTP |
| `Toggle` / `ToggleGroup` | Bouton toggle / groupe |

### Layout et conteneurs

| Composant | Description |
|-----------|-------------|
| `Card` | Conteneur carte avec Header/Content/Footer |
| `Dialog` | Modal dialogue |
| `Sheet` | Panneau lateral |
| `Drawer` | Tiroir bas |
| `Tabs` | Systeme d'onglets |
| `Accordion` | Sections collapsibles |
| `Collapsible` | Zone collapsible |
| `ResizablePanel` | Panneaux redimensionnables |
| `ScrollArea` | Zone defilante personnalisee |
| `Separator` | Separateur visuel |
| `AspectRatio` | Ratio d'aspect fixe |

### Navigation

| Composant | Description |
|-----------|-------------|
| `NavigationMenu` | Menu de navigation principal |
| `Menubar` | Barre de menu |
| `Breadcrumb` | Fil d'Ariane |
| `Pagination` | Navigation paginee |
| `Sidebar` | Barre laterale |
| `Command` | Palette de commandes (recherche) |

### Feedback et affichage

| Composant | Description |
|-----------|-------------|
| `Alert` / `AlertDialog` | Alertes et confirmations |
| `Badge` | Badge informatif |
| `Progress` | Barre de progression |
| `Skeleton` | Placeholder de chargement |
| `Sonner` | Notifications toast |
| `Tooltip` | Infobulle |
| `HoverCard` | Carte au survol |
| `Avatar` | Avatar utilisateur |
| `Table` | Tableau de donnees |
| `Chart` | Integration Recharts |

### Overlay et menus

| Composant | Description |
|-----------|-------------|
| `DropdownMenu` | Menu deroulant |
| `ContextMenu` | Menu contextuel (clic droit) |
| `Popover` | Bulle contextuelle |
| `Carousel` | Carrousel (embla-carousel) |

### Utilitaires

| Fichier | Description |
|---------|-------------|
| `utils.ts` | Helper `cn()` : fusion clsx + tailwind-merge |
| `use-mobile.ts` | Hook detection mobile |

---

## Hooks personnalises

| Hook | Fichier | Description |
|------|---------|-------------|
| `useAuth` | `contexts/AuthContext.tsx` | Acces au contexte d'authentification |
| `useProjects` | `hooks/useProjects.ts` | Fetching et cache des projets |
| `useProjectsFilters` | `hooks/useProjectsFilters.ts` | Gestion de l'etat des filtres de recherche |

---

## Contextes React

| Contexte | Fichier | Scope | Description |
|----------|---------|-------|-------------|
| `AuthContext` | `contexts/AuthContext.tsx` | Global (wrap App) | Authentification JWT, etat utilisateur, login/logout |
