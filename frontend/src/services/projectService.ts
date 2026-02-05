import type { Project } from '@/types/project';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
