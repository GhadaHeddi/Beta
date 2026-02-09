import type {
  Project,
  PropertyType,
  ProjectFilters,
  ProjectSort,
  ProjectPagination,
  ProjectsResponse,
  FiltersMetadata
} from '@/types/project';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Données pour créer un nouveau projet
 */
export interface ProjectCreateData {
  title: string;
  address: string;
  property_type: PropertyType;
}

/**
 * Récupère la liste des projets récents.
 * Utilise l'endpoint de dev (sans auth) pour les tests.
 * TODO: Remplacer par /projects/ avec authentification en production.
 */
export async function getRecentProjects(): Promise<Project[]> {
  // Mode dev : endpoint sans authentification
  const response = await fetch(`${API_BASE}/api/projects/dev/all`, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Erreur serveur (${response.status})`);
  }

  // L'endpoint renvoie un objet paginé, on extrait les projets
  const data: ProjectsResponse = await response.json();
  return data.projects;
}

/**
 * Version avec authentification (à utiliser en production)
 */
export async function getRecentProjectsAuth(): Promise<Project[]> {
  const token = localStorage.getItem('access_token');

  if (!token) {
    throw new Error('Non authentifié');
  }

  const response = await fetch(`${API_BASE}/projects/`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (response.status === 401) {
    throw new Error('Session expirée');
  }

  if (!response.ok) {
    throw new Error(`Erreur serveur (${response.status})`);
  }

  return response.json();
}

/**
 * Crée un nouveau projet (mode dev, sans auth)
 * TODO: Remplacer par createProjectAuth en production
 */
export async function createProject(data: ProjectCreateData): Promise<Project> {
  const response = await fetch(`${API_BASE}/api/projects/dev/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Erreur serveur (${response.status})`);
  }

  return response.json();
}

/**
 * Crée un nouveau projet avec authentification (production)
 */
export async function createProjectAuth(data: ProjectCreateData): Promise<Project> {
  const token = localStorage.getItem('access_token');

  if (!token) {
    throw new Error('Non authentifié');
  }

  const response = await fetch(`${API_BASE}/projects/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (response.status === 401) {
    throw new Error('Session expirée');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Erreur serveur (${response.status})`);
  }

  return response.json();
}

/**
 * Récupère un projet par son ID (mode dev, sans auth)
 * TODO: Remplacer par getProjectByIdAuth en production
 */
export async function getProjectById(projectId: number): Promise<Project> {
  const response = await fetch(`${API_BASE}/api/projects/dev/${projectId}`, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Projet non trouvé');
    }
    throw new Error(`Erreur serveur (${response.status})`);
  }

  return response.json();
}

/**
 * Récupère un projet par son ID avec authentification (production)
 */
export async function getProjectByIdAuth(projectId: number): Promise<Project> {
  const token = localStorage.getItem('access_token');

  if (!token) {
    throw new Error('Non authentifié');
  }

  const response = await fetch(`${API_BASE}/api/projects/${projectId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (response.status === 401) {
    throw new Error('Session expirée');
  }

  if (response.status === 404) {
    throw new Error('Projet non trouvé');
  }

  if (!response.ok) {
    throw new Error(`Erreur serveur (${response.status})`);
  }

  return response.json();
}


// === Fonctions pour le filtrage et la recherche ===

/**
 * Construit la query string à partir des paramètres de filtrage
 */
function buildQueryString(
  filters: Partial<ProjectFilters>,
  sort: ProjectSort,
  pagination: ProjectPagination,
  includeMetadata: boolean = false
): string {
  const params = new URLSearchParams();

  // Paramètres de recherche
  if (filters.search) {
    params.append('search', filters.search);
  }

  // Types de bien (multi-select)
  if (filters.propertyTypes && filters.propertyTypes.length > 0) {
    filters.propertyTypes.forEach(type => params.append('property_types', type));
  }

  // Ville
  if (filters.city) {
    params.append('city', filters.city);
  }

  // Consultant
  if (filters.consultantId) {
    params.append('consultant_id', String(filters.consultantId));
  }

  // Plage d'années de construction
  if (filters.constructionYearMin) {
    params.append('construction_year_min', String(filters.constructionYearMin));
  }
  if (filters.constructionYearMax) {
    params.append('construction_year_max', String(filters.constructionYearMax));
  }

  // Tri
  params.append('sort_by', sort.sortBy);
  params.append('sort_order', sort.sortOrder);

  // Pagination
  params.append('page', String(pagination.page));
  params.append('page_size', String(pagination.pageSize));

  // Métadonnées
  if (includeMetadata) {
    params.append('include_metadata', 'true');
  }

  return params.toString();
}

/**
 * Récupère les projets avec filtrage, tri et pagination (mode dev)
 */
export async function getProjectsWithFilters(
  filters: Partial<ProjectFilters>,
  sort: ProjectSort,
  pagination: ProjectPagination,
  includeMetadata: boolean = false
): Promise<ProjectsResponse> {
  const queryString = buildQueryString(filters, sort, pagination, includeMetadata);

  const response = await fetch(`${API_BASE}/api/projects/dev/all?${queryString}`, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Erreur serveur (${response.status})`);
  }

  return response.json();
}

/**
 * Récupère les métadonnées des filtres (mode dev)
 */
export async function getFiltersMetadata(): Promise<FiltersMetadata> {
  const response = await fetch(`${API_BASE}/api/projects/dev/filters/metadata`, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Erreur serveur (${response.status})`);
  }

  return response.json();
}
