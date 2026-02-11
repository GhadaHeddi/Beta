export type LocalType = "Bureaux" | "Commerce" | "Entrepôt" | "Local d'activité" | "Terrain" | "Autre";

export interface PropertyBreakdown {
  id: number;
  project_id: number;
  local_type: LocalType;
  surface: number;
  price_per_m2: number | null;
  rental_value_per_m2: number | null;
  venal_value_hd: number | null;
  rental_value_annual: number | null;
  rental_value_monthly: number | null;
  is_venal_override: boolean;
  is_rental_annual_override: boolean;
  is_rental_monthly_override: boolean;
  order: number;
}

export interface PropertyBreakdownInput {
  id?: number;
  local_type: LocalType;
  surface: number;
  price_per_m2: number | null;
  rental_value_per_m2: number | null;
  venal_value_hd: number | null;
  rental_value_annual: number | null;
  rental_value_monthly: number | null;
  is_venal_override: boolean;
  is_rental_annual_override: boolean;
  is_rental_monthly_override: boolean;
  order: number;
}

export interface MarketEstimation {
  id: number;
  project_id: number;
  sale_price_low: number | null;
  sale_price_high: number | null;
  sale_price_custom: number | null;
  sale_capitalization_rate: number;
  rent_low: number | null;
  rent_high: number | null;
  rent_custom: number | null;
  rent_capitalization_rate: number;
}

export interface SynthesisTotals {
  surface: number;
  price_per_m2: number;
  rental_value_per_m2: number;
  venal_value_hd: number;
  rental_value_annual: number;
  rental_value_monthly: number;
}
