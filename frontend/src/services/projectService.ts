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

  return response.json();
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

/**
 * Supprime un projet (soft delete - déplace dans la corbeille)
 * Mode dev, sans auth
 * TODO: Remplacer par deleteProjectAuth en production
 */
export async function deleteProject(projectId: number): Promise<Project> {
  const response = await fetch(`${API_BASE}/api/projects/dev/${projectId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Projet non trouvé');
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Erreur serveur (${response.status})`);
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
 * Restaure un projet depuis la corbeille (mode dev, sans auth)
 */
export async function restoreProject(projectId: number): Promise<Project> {
  const response = await fetch(`${API_BASE}/api/projects/dev/${projectId}/restore`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Projet non trouvé');
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Erreur serveur (${response.status})`);
  }

  return response.json();
}
