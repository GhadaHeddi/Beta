import type { Agency, AgencyWithStats } from '@/types/project';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('access_token');
  if (!token) throw new Error('Non authentifie');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Recupere toutes les agences (admin uniquement)
 */
export async function getAllAgencies(): Promise<Agency[]> {
  const response = await fetch(`${API_BASE}/api/agencies/`, {
    headers: getAuthHeaders(),
  });

  if (response.status === 401) throw new Error('Session expiree');
  if (!response.ok) throw new Error(`Erreur serveur (${response.status})`);

  return response.json();
}

/**
 * Recupere les agences de l'utilisateur connecte
 */
export async function getMyAgencies(): Promise<Agency[]> {
  const response = await fetch(`${API_BASE}/api/agencies/mine`, {
    headers: getAuthHeaders(),
  });

  if (response.status === 401) throw new Error('Session expiree');
  if (!response.ok) throw new Error(`Erreur serveur (${response.status})`);

  return response.json();
}

/**
 * Recupere une agence avec ses statistiques
 */
export async function getAgencyWithStats(agencyId: number): Promise<AgencyWithStats> {
  const response = await fetch(`${API_BASE}/api/agencies/${agencyId}`, {
    headers: getAuthHeaders(),
  });

  if (response.status === 401) throw new Error('Session expiree');
  if (response.status === 404) throw new Error('Agence non trouvee');
  if (!response.ok) throw new Error(`Erreur serveur (${response.status})`);

  return response.json();
}

/**
 * Cree une nouvelle agence
 */
export async function createAgency(data: {
  name: string;
  address?: string;
  city?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
}): Promise<Agency> {
  const response = await fetch(`${API_BASE}/api/agencies/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (response.status === 401) throw new Error('Session expiree');
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Erreur serveur (${response.status})`);
  }

  return response.json();
}
