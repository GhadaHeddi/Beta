/**
 * ORYEM API Service
 * Service centralisé pour toutes les communications avec le backend FastAPI
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Types
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Project {
  id: number;
  user_id: number;
  title: string;
  address: string;
  property_type: PropertyType;
  status: ProjectStatus;
  current_step: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  title: string;
  address: string;
  property_type: PropertyType;
}

export interface ProjectUpdate {
  title?: string;
  address?: string;
  property_type?: PropertyType;
  status?: ProjectStatus;
  current_step?: number;
}

export type PropertyType = 'office' | 'warehouse' | 'retail' | 'industrial' | 'land' | 'mixed';
export type ProjectStatus = 'draft' | 'in_progress' | 'completed' | 'archived';

export interface PropertyInfo {
  id: number;
  project_id: number;
  surface_area?: number;
  construction_year?: number;
  floors?: number;
  parking_spaces?: number;
  description?: string;
  strengths?: string;
  weaknesses?: string;
  opportunities?: string;
  threats?: string;
}

export interface PropertyInfoUpdate {
  surface_area?: number;
  construction_year?: number;
  floors?: number;
  parking_spaces?: number;
  description?: string;
  strengths?: string;
  weaknesses?: string;
  opportunities?: string;
  threats?: string;
}

export interface ApiError {
  detail: string;
}

// Token management
let authToken: string | null = localStorage.getItem('auth_token');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

export const getAuthToken = () => authToken;

// HTTP client helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({ detail: 'Une erreur est survenue' }));
    throw new Error(error.detail);
  }

  // Handle empty responses
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// ==================== AUTH API ====================

export const authApi = {
  /**
   * Connexion utilisateur
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    setAuthToken(response.access_token);
    return response;
  },

  /**
   * Inscription utilisateur
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setAuthToken(response.access_token);
    return response;
  },

  /**
   * Déconnexion
   */
  logout: async (): Promise<void> => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } finally {
      setAuthToken(null);
    }
  },

  /**
   * Récupérer l'utilisateur courant
   */
  getCurrentUser: async (): Promise<User> => {
    return apiRequest<User>('/api/auth/me');
  },
};

// ==================== PROJECTS API ====================

export const projectsApi = {
  /**
   * Lister tous les projets de l'utilisateur
   */
  list: async (): Promise<Project[]> => {
    return apiRequest<Project[]>('/api/projects');
  },

  /**
   * Récupérer un projet par ID
   */
  get: async (id: number): Promise<Project> => {
    return apiRequest<Project>(`/api/projects/${id}`);
  },

  /**
   * Créer un nouveau projet
   */
  create: async (data: ProjectCreate): Promise<Project> => {
    return apiRequest<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Mettre à jour un projet
   */
  update: async (id: number, data: ProjectUpdate): Promise<Project> => {
    return apiRequest<Project>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Supprimer un projet
   */
  delete: async (id: number): Promise<void> => {
    return apiRequest(`/api/projects/${id}`, { method: 'DELETE' });
  },

  /**
   * Récupérer les informations de propriété d'un projet
   */
  getPropertyInfo: async (projectId: number): Promise<PropertyInfo> => {
    return apiRequest<PropertyInfo>(`/api/projects/${projectId}/property-info`);
  },

  /**
   * Mettre à jour les informations de propriété
   */
  updatePropertyInfo: async (projectId: number, data: PropertyInfoUpdate): Promise<PropertyInfo> => {
    return apiRequest<PropertyInfo>(`/api/projects/${projectId}/property-info`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// ==================== HEALTH API ====================

export const healthApi = {
  /**
   * Vérifier l'état de l'API
   */
  check: async (): Promise<{ status: string; database: string }> => {
    return apiRequest('/api/health');
  },
};

// Export default for convenience
export default {
  auth: authApi,
  projects: projectsApi,
  health: healthApi,
};
