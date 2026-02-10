import type { Project, PropertyType } from '@/types/project';

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
 * Version avec authentification (à utiliser en production)
 */
export async function getRecentProjectsAuth(): Promise<Project[]> {
  const token = localStorage.getItem('access_token');

  if (!token) {
    throw new Error('Non authentifié');
  }

  const response = await fetch(`${API_BASE}/api/projects/`, {
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
 * Crée un nouveau projet avec authentification (production)
 */
export async function createProjectAuth(data: ProjectCreateData): Promise<Project> {
  const token = localStorage.getItem('access_token');

  if (!token) {
    throw new Error('Non authentifié');
  }

  const response = await fetch(`${API_BASE}/api/projects/`, {
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

/**
 * Supprime un projet avec authentification (production)
 */
export async function deleteProjectAuth(projectId: number): Promise<Project> {
  const token = localStorage.getItem('access_token');

  if (!token) {
    throw new Error('Non authentifié');
  }

  const response = await fetch(`${API_BASE}/api/projects/${projectId}`, {
    method: 'DELETE',
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
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Erreur serveur (${response.status})`);
  }

  return response.json();
}

/**
 * Restaure un projet depuis la corbeille avec authentification (production)
 */
export async function restoreProjectAuth(projectId: number): Promise<Project> {
  const token = localStorage.getItem('access_token');

  if (!token) {
    throw new Error('Non authentifié');
  }

  const response = await fetch(`${API_BASE}/api/projects/${projectId}/restore`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (response.status === 401) {
    throw new Error('Session expirée');
  }
}
/*
 * Interface pour les données du bien immobilier
 */
export interface PropertyInfoData {
  owner_name?: string;
  owner_contact?: string;
  occupant_name?: string;
  occupant_contact?: string;
  construction_year?: number;
  materials?: string;
  total_surface?: number;
  terrain_surface?: number;
  geographic_sector?: string;
  swot_strengths?: string;
  swot_weaknesses?: string;
  swot_opportunities?: string;
  swot_threats?: string;
  notes?: string;
}

/**
 * Sauvegarde les informations du bien pour un projet
 * Utilise l'endpoint de dev (sans auth) pour les tests.
 * TODO: Remplacer par /{project_id}/property-info avec authentification en production.
 * @param projectId ID du projet
 * @param data Données du bien à sauvegarder
 */
export async function savePropertyInfo(projectId: number, data: PropertyInfoData): Promise<PropertyInfoData> {
  // Mode dev : endpoint sans authentification
  const response = await fetch(`${API_BASE}/api/${projectId}/property-info`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (response.status === 404) {
    throw new Error('Projet non trouvé');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Erreur serveur (${response.status})`);
  }

  return response.json();
}

/**
 * Récupère les projets dans la corbeille avec authentification (production)
 * - Admin : voit tous les projets supprimés de son équipe
 * - Consultant : voit uniquement ses propres projets supprimés
 */
export async function getTrashProjectsAuth(): Promise<Project[]> {
  const token = localStorage.getItem('access_token');

  if (!token) {
    throw new Error('Non authentifié');
  }

  const response = await fetch(`${API_BASE}/api/projects/trash`, {
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
 * Supprime définitivement un projet avec authentification (production)
 * Le projet doit être dans la corbeille.
 */
export async function permanentDeleteProjectAuth(projectId: number): Promise<void> {
  const token = localStorage.getItem('access_token');

  if (!token) {
    throw new Error('Non authentifié');
  }

  const response = await fetch(`${API_BASE}/api/projects/${projectId}/permanent`, {
    method: 'DELETE',
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
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Erreur serveur (${response.status})`);
  }
}

// === Fonctions de partage ===

export type SharePermission = 'read' | 'write' | 'admin';

export interface UserBrief {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

export interface ProjectShare {
  id: number;
  project_id: number;
  user_id: number;
  can_write: boolean;
  permission: SharePermission;
  created_at: string;
  user: UserBrief;
}

export interface ShareCreateData {
  email?: string;
  user_id?: number;
  permission: SharePermission;
}

/**
 * Recherche les utilisateurs disponibles pour le partage d'un projet
 */
export async function getAvailableUsersForShare(projectId: number, search: string = ''): Promise<UserBrief[]> {
  const token = localStorage.getItem('access_token');

  if (!token) {
    throw new Error('Non authentifié');
  }

  const params = new URLSearchParams();
  if (search) params.append('search', search);

  const response = await fetch(`${API_BASE}/api/projects/${projectId}/available-users?${params}`, {
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
 * Récupère la liste des partages d'un projet
 */
export async function getProjectShares(projectId: number): Promise<ProjectShare[]> {
  const token = localStorage.getItem('access_token');

  if (!token) {
    throw new Error('Non authentifié');
  }

  const response = await fetch(`${API_BASE}/api/projects/${projectId}/shares`, {
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
 * Partage un projet avec un utilisateur
 */
export async function shareProject(projectId: number, data: ShareCreateData): Promise<ProjectShare> {
  const token = localStorage.getItem('access_token');

  if (!token) {
    throw new Error('Non authentifié');
  }

  const response = await fetch(`${API_BASE}/api/projects/${projectId}/shares`, {
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
 * Modifie les permissions d'un partage
 */
export async function updateProjectShare(projectId: number, userId: number, permission: SharePermission): Promise<ProjectShare> {
  const token = localStorage.getItem('access_token');

  if (!token) {
    throw new Error('Non authentifié');
  }

  const response = await fetch(`${API_BASE}/api/projects/${projectId}/shares/${userId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ permission })
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
 * Supprime un partage
 */
export async function removeProjectShare(projectId: number, userId: number): Promise<void> {
  const token = localStorage.getItem('access_token');

  if (!token) {
    throw new Error('Non authentifié');
  }

  const response = await fetch(`${API_BASE}/api/projects/${projectId}/shares/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (response.status === 401) {
    throw new Error('Session expirée');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Erreur serveur (${response.status})`);
  }
}


// === Fonctions Comparables ===

import type {
  ComparableSearchResponse,
  ComparisonFilters,
  SelectedComparable
} from '@/types/comparable';

/**
 * Recherche des biens comparables avec filtres
 * Utilise l'endpoint DEV sans authentification pour le developpement
 */
export async function searchComparables(
  projectId: number,
  filters: ComparisonFilters
): Promise<ComparableSearchResponse> {
  const params = new URLSearchParams();

  if (filters.surfaceMin !== null) {
    params.append('surface_min', filters.surfaceMin.toString());
  }
  if (filters.surfaceMax !== null) {
    params.append('surface_max', filters.surfaceMax.toString());
  }
  if (filters.yearMin !== null) {
    params.append('year_min', filters.yearMin.toString());
  }
  if (filters.yearMax !== null) {
    params.append('year_max', filters.yearMax.toString());
  }
  params.append('distance_km', filters.distanceKm.toString());
  params.append('source', filters.source);

  // Mode DEV: endpoint sans authentification
  const response = await fetch(
    `${API_BASE}/api/projects/${projectId}/comparables/dev/search?${params}`,
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  if (response.status === 404) {
    throw new Error('Projet non trouve');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Erreur serveur (${response.status})`);
  }

  return response.json();
}

/**
 * Recupere les comparables selectionnes pour un projet
 */
export async function getSelectedComparables(projectId: number): Promise<SelectedComparable[]> {
  // Mode DEV: endpoint sans authentification
  const response = await fetch(
    `${API_BASE}/api/projects/${projectId}/comparables/dev/selected`,
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Erreur serveur (${response.status})`);
  }

  return response.json();
}

/**
 * Selectionne un comparable du pool pour ce projet
 */
export async function selectComparable(
  projectId: number,
  comparablePoolId: number,
  adjustment: number = 0,
  notes?: string
): Promise<SelectedComparable> {
  // Mode DEV: endpoint sans authentification
  const response = await fetch(
    `${API_BASE}/api/projects/${projectId}/comparables/dev/select`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        comparable_pool_id: comparablePoolId,
        adjustment,
        notes
      })
    }
  );

  if (response.status === 400) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Maximum 3 comparables atteint');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Erreur serveur (${response.status})`);
  }

  return response.json();
}

/**
 * Retire un comparable de la selection
 */
export async function deselectComparable(
  projectId: number,
  comparableId: number
): Promise<void> {
  // Mode DEV: endpoint sans authentification
  const response = await fetch(
    `${API_BASE}/api/projects/${projectId}/comparables/dev/select/${comparableId}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  if (response.status === 404) {
    throw new Error('Comparable non trouve');
  }

  if (!response.ok && response.status !== 204) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Erreur serveur (${response.status})`);
  }
}

/**
 * Met a jour l'ajustement d'un comparable
 */
export async function updateComparableAdjustment(
  projectId: number,
  comparableId: number,
  adjustment: number
): Promise<SelectedComparable> {
  const token = localStorage.getItem('access_token');

  if (!token) {
    throw new Error('Non authentifie');
  }

  const response = await fetch(
    `${API_BASE}/api/projects/${projectId}/comparables/select/${comparableId}/adjustment`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ adjustment })
    }
  );

  if (response.status === 401) {
    throw new Error('Session expiree');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Erreur serveur (${response.status})`);
  }

  return response.json();
}

/**
 * Valide les comparables selectionnes et passe a l'etape suivante
 */
export async function validateComparables(projectId: number): Promise<{ message: string; current_step: number }> {
  const token = localStorage.getItem('access_token');

  if (!token) {
    throw new Error('Non authentifie');
  }

  const response = await fetch(
    `${API_BASE}/api/projects/${projectId}/comparables/validate`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (response.status === 401) {
    throw new Error('Session expiree');
  }

  if (response.status === 400) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Selectionnez au moins un comparable');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Erreur serveur (${response.status})`);
  }

  return response.json();
}
