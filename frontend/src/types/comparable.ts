/**
 * Types pour les biens comparables
 */

export type ComparableSource = 'arthur_loyd' | 'concurrence';
export type TransactionType = 'sale' | 'rent';

/**
 * Comparable du pool de reference
 */
export interface ComparablePool {
  id: number;
  address: string;
  postal_code: string | null;
  city: string | null;
  latitude: number;
  longitude: number;
  property_type: string;
  surface: number;
  construction_year: number | null;
  transaction_type: TransactionType;
  price: number;
  price_per_m2: number;
  transaction_date: string | null;
  source: ComparableSource;
  source_reference: string | null;
  photo_url: string | null;
  distance_km?: number;
}

/**
 * Statistiques de prix
 */
export interface PriceStats {
  avg_rent_per_m2: number | null;
  rent_count: number;
  avg_sale_per_m2: number | null;
  sale_count: number;
  latest_sale_per_m2: number | null;
  latest_sale_date: string | null;
  total_count: number;
}

/**
 * Centre de la carte (coordonnees du bien evalue)
 */
export interface MapCenter {
  lat: number;
  lng: number;
}

/**
 * Reponse de la recherche de comparables
 */
export interface ComparableSearchResponse {
  comparables: ComparablePool[];
  stats: PriceStats;
  center: MapCenter | null;
}

/**
 * Comparable selectionne pour un projet
 */
export interface SelectedComparable {
  id: number;
  address: string;
  postal_code: string | null;
  city: string | null;
  surface: number;
  price: number;
  price_per_m2: number;
  latitude: number | null;
  longitude: number | null;
  transaction_date: string | null;
  adjustment: number;
  adjusted_price_per_m2: number | null;
  validated: boolean;
  validation_notes: string | null;
  source: string | null;
  source_reference: string | null;
}

/**
 * Filtres de recherche
 */
export interface ComparisonFilters {
  surfaceMin: number | null;
  surfaceMax: number | null;
  yearMin: number | null;
  yearMax: number | null;
  distanceKm: number;
  source: 'all' | 'arthur_loyd' | 'concurrence';
}

/**
 * Valeurs par defaut des filtres
 */
export const DEFAULT_COMPARISON_FILTERS: ComparisonFilters = {
  surfaceMin: null,
  surfaceMax: null,
  yearMin: null,
  yearMax: null,
  distanceKm: 5,
  source: 'all'
};

/**
 * Bien evalue (pour la comparaison)
 */
export interface EvaluatedProperty {
  address: string;
  surface: number | null;
  construction_year: number | null;
  latitude: number | null;
  longitude: number | null;
  property_type: string;
}
