// Types alignés avec le backend FastAPI

// Interfaces Agence
export interface AgencyBrief {
  id: number;
  name: string;
  city: string | null;
}

export interface Agency {
  id: number;
  name: string;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgencyWithStats extends Agency {
  consultants_count: number;
  projects_count: number;
  projects_in_progress: number;
  projects_completed: number;
}

// Enums alignés avec le backend
export type ProjectStatus = 'draft' | 'in_progress' | 'completed' | 'archived';
export type PropertyType = 'office' | 'warehouse' | 'retail' | 'industrial' | 'land' | 'mixed';

// Types pour le tri
export type SortField = 'created_at' | 'updated_at' | 'title' | 'construction_year';
export type SortOrder = 'asc' | 'desc';

// Interface UserBrief
export interface UserBrief {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'consultant';
}

// Interface PropertyInfo simplifié
export interface PropertyInfoBrief {
  total_surface: number | null;
  occupant_name: string | null;
  construction_year: number | null;
  latitude: number | null;
  longitude: number | null;
}

// Interface Project complète
export interface Project {
  id: number;
  title: string;
  address: string;
  long_address: string | null;
  property_type: PropertyType;
  status: ProjectStatus;
  user_id: number;
  agency_id: number | null;
  current_step: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user: UserBrief;
  property_info: PropertyInfoBrief | null;
  agency: AgencyBrief | null;
}

// === Types pour le filtrage et la recherche ===

export interface ProjectFilters {
  search: string;
  propertyTypes: PropertyType[];
  city: string;
  consultantId: number | null;
  constructionYearMin: number | null;
  constructionYearMax: number | null;
  agencyId: number | null;
}

export interface ProjectSort {
  sortBy: SortField;
  sortOrder: SortOrder;
}

export interface ProjectPagination {
  page: number;
  pageSize: number;
}

export interface FiltersMetadata {
  available_cities: string[];
  available_consultants: UserBrief[];
  construction_year_range: [number | null, number | null];
  property_type_counts: Record<string, number>;
}

export interface ProjectsResponse {
  projects: Project[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  filters_metadata: FiltersMetadata | null;
}

// Valeurs par défaut
export const defaultFilters: ProjectFilters = {
  search: '',
  propertyTypes: [],
  city: '',
  consultantId: null,
  constructionYearMin: null,
  constructionYearMax: null,
  agencyId: null,
};

export const defaultSort: ProjectSort = {
  sortBy: 'updated_at',
  sortOrder: 'desc',
};

export const defaultPagination: ProjectPagination = {
  page: 1,
  pageSize: 20,
};
