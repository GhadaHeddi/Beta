import type { PropertyBreakdown, PropertyBreakdownInput, MarketEstimation } from '@/types/analysis';
import type { SelectedComparable } from '@/types/comparable';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getHeaders(): Record<string, string> {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };
}

function devOrAuth(projectId: number, path: string): string {
  const token = localStorage.getItem('access_token');
  if (token) {
    return `${API_BASE}/api/projects/${projectId}/analysis${path}`;
  }
  return `${API_BASE}/api/projects/${projectId}/analysis/dev${path}`;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) throw new Error('Session expirée');
  if (response.status === 404) throw new Error('Ressource non trouvée');
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Erreur serveur (${response.status})`);
  }
  return response.json();
}

// === Breakdowns ===

export async function getBreakdowns(projectId: number): Promise<PropertyBreakdown[]> {
  const response = await fetch(devOrAuth(projectId, '/breakdowns'), {
    headers: getHeaders(),
  });
  return handleResponse<PropertyBreakdown[]>(response);
}

export async function createBreakdown(
  projectId: number,
  data: Omit<PropertyBreakdownInput, 'id'>
): Promise<PropertyBreakdown> {
  const response = await fetch(devOrAuth(projectId, '/breakdowns'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<PropertyBreakdown>(response);
}

export async function updateBreakdown(
  projectId: number,
  breakdownId: number,
  data: Partial<PropertyBreakdownInput>
): Promise<PropertyBreakdown> {
  const token = localStorage.getItem('access_token');
  const url = token
    ? `${API_BASE}/api/projects/${projectId}/analysis/breakdowns/${breakdownId}`
    : `${API_BASE}/api/projects/${projectId}/analysis/dev/breakdowns/${breakdownId}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<PropertyBreakdown>(response);
}

export async function deleteBreakdown(projectId: number, breakdownId: number): Promise<void> {
  const token = localStorage.getItem('access_token');
  const url = token
    ? `${API_BASE}/api/projects/${projectId}/analysis/breakdowns/${breakdownId}`
    : `${API_BASE}/api/projects/${projectId}/analysis/dev/breakdowns/${breakdownId}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok && response.status !== 204) {
    throw new Error(`Erreur serveur (${response.status})`);
  }
}

export async function bulkSaveBreakdowns(
  projectId: number,
  items: PropertyBreakdownInput[]
): Promise<PropertyBreakdown[]> {
  const response = await fetch(devOrAuth(projectId, '/breakdowns/bulk'), {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ items }),
  });
  return handleResponse<PropertyBreakdown[]>(response);
}

// === Market Estimation ===

export async function getEstimation(projectId: number): Promise<MarketEstimation> {
  const response = await fetch(devOrAuth(projectId, '/estimation'), {
    headers: getHeaders(),
  });
  return handleResponse<MarketEstimation>(response);
}

export async function saveEstimation(
  projectId: number,
  data: Partial<MarketEstimation>
): Promise<MarketEstimation> {
  const response = await fetch(devOrAuth(projectId, '/estimation'), {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<MarketEstimation>(response);
}

// === Comparables (réutilise l'endpoint existant) ===

export async function getValidatedComparables(projectId: number): Promise<SelectedComparable[]> {
  const token = localStorage.getItem('access_token');
  const url = token
    ? `${API_BASE}/api/projects/${projectId}/comparables/selected`
    : `${API_BASE}/api/projects/${projectId}/comparables/dev/selected`;
  const response = await fetch(url, {
    headers: getHeaders(),
  });
  const data = await handleResponse<SelectedComparable[]>(response);
  return data.filter((c) => c.validated);
}
