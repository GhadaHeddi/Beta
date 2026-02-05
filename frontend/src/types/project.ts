// Types alignés avec le backend FastAPI

// Enums alignés avec le backend
export type ProjectStatus = 'draft' | 'in_progress' | 'completed' | 'archived';
export type PropertyType = 'office' | 'warehouse' | 'retail' | 'industrial' | 'land' | 'mixed';

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
}

// Interface Project complète
export interface Project {
  id: number;
  title: string;
  address: string;
  property_type: PropertyType;
  status: ProjectStatus;
  user_id: number;
  current_step: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user: UserBrief;
  property_info: PropertyInfoBrief | null;
}
