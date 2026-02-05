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

/**
 * Interface pour la création d'un projet
 */
export interface CreateProjectData {
  title: string;
  address: string;
  property_type: string;
}

/**
 * Mapping des types de biens français vers les valeurs enum du backend
 */
const propertyTypeMapping: Record<string, string> = {
  'bureaux': 'office',
  'locaux_activite': 'warehouse',
  'local_commercial': 'retail',
  'terrain': 'land',
  // Valeurs directes (si déjà en anglais)
  'office': 'office',
  'warehouse': 'warehouse',
  'retail': 'retail',
  'industrial': 'industrial',
  'land': 'land',
  'mixed': 'mixed',
};

/**
 * Convertit un type de bien français en valeur enum backend
 */
function mapPropertyType(frenchType: string): string {
  return propertyTypeMapping[frenchType] || frenchType;
}

/**
 * Interface pour la réponse de création d'un projet
 */
export interface CreateProjectResponse {
  id: number;
  title: string;
  address: string;
  property_type: string;
  status: string;
  current_step: number;
  created_at: string;
  updated_at: string;
}

/**
 * Crée un nouveau projet
 * Utilise l'endpoint de dev (sans auth) pour les tests.
 * TODO: Remplacer par /projects/ avec authentification en production.
 * @param data Données du projet
 * @returns Le projet créé avec son ID
 */
export async function createProject(data: CreateProjectData): Promise<CreateProjectResponse> {
  // Mode dev : endpoint sans authentification
  // Convertir le type de bien français en valeur enum backend
  const mappedData = {
    ...data,
    property_type: mapPropertyType(data.property_type),
  };

  const response = await fetch(`${API_BASE}/api/projects/dev/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(mappedData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Erreur lors de la création du projet (${response.status})`);
  }

  return response.json();
}

/**
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
  const response = await fetch(`${API_BASE}/api/projects/dev/${projectId}/property-info`, {
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
    const errorText = await response.text();
    throw new Error(errorText || `Erreur serveur (${response.status})`);
  }

  return response.json();
}
