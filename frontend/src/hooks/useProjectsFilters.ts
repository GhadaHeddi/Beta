import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getProjectsWithFilters } from '@/services/projectService';
import type {
  Project,
  ProjectFilters,
  ProjectSort,
  ProjectPagination,
  FiltersMetadata,
  PropertyType,
  SortField,
  SortOrder,
} from '@/types/project';
import {
  defaultFilters,
  defaultSort,
  defaultPagination,
} from '@/types/project';

// Hook de debounce custom
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export interface UseProjectsFiltersReturn {
  // Donnees
  projects: Project[];
  total: number;
  totalPages: number;
  metadata: FiltersMetadata | null;

  // Etat
  filters: ProjectFilters;
  sort: ProjectSort;
  pagination: ProjectPagination;

  // Etats de chargement
  loading: boolean;
  error: string | null;

  // Actions
  setSearch: (search: string) => void;
  setPropertyTypes: (types: PropertyType[]) => void;
  togglePropertyType: (type: PropertyType) => void;
  setCity: (city: string) => void;
  setConsultantId: (id: number | null) => void;
  setConstructionYearRange: (min: number | null, max: number | null) => void;
  setSort: (sort: ProjectSort) => void;
  setSortBy: (sortBy: SortField) => void;
  setSortOrder: (sortOrder: SortOrder) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  resetFilters: () => void;
  refetch: () => void;

  // Calcules
  activeFiltersCount: number;
  hasActiveFilters: boolean;
  hasSearch: boolean;
}

export function useProjectsFilters(): UseProjectsFiltersReturn {
  // Etat des donnees
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [metadata, setMetadata] = useState<FiltersMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Etat des filtres, tri et pagination
  const [filters, setFilters] = useState<ProjectFilters>(defaultFilters);
  const [sort, setSort] = useState<ProjectSort>(defaultSort);
  const [pagination, setPagination] = useState<ProjectPagination>(defaultPagination);

  // Debounce de la recherche (300ms)
  const debouncedSearch = useDebouncedValue(filters.search, 300);

  // Ref pour eviter les appels multiples
  const fetchIdRef = useRef(0);

  // Fonction de fetch
  const fetchProjects = useCallback(async () => {
    const fetchId = ++fetchIdRef.current;
    setLoading(true);
    setError(null);

    try {
      // Utiliser la recherche debounced
      const filtersWithDebouncedSearch = { ...filters, search: debouncedSearch };

      // Toujours inclure les metadonnees pour avoir les compteurs a jour
      const response = await getProjectsWithFilters(
        filtersWithDebouncedSearch,
        sort,
        pagination,
        true  // Toujours demander les metadonnees
      );

      // Verifier que c'est toujours le dernier fetch
      if (fetchId !== fetchIdRef.current) return;

      setProjects(response.projects);
      setTotal(response.total);
      setTotalPages(response.total_pages);

      if (response.filters_metadata) {
        setMetadata(response.filters_metadata);
      }
    } catch (err) {
      if (fetchId !== fetchIdRef.current) return;
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      if (fetchId === fetchIdRef.current) {
        setLoading(false);
      }
    }
  }, [filters, debouncedSearch, sort, pagination]);

  // Auto-fetch lors des changements
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Reset de la page quand les filtres changent
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [
    filters.propertyTypes,
    filters.city,
    filters.consultantId,
    filters.constructionYearMin,
    filters.constructionYearMax,
    debouncedSearch
  ]);

  // Actions
  const setSearch = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search }));
  }, []);

  const setPropertyTypes = useCallback((propertyTypes: PropertyType[]) => {
    setFilters(prev => ({ ...prev, propertyTypes }));
  }, []);

  const togglePropertyType = useCallback((type: PropertyType) => {
    setFilters(prev => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(type)
        ? prev.propertyTypes.filter(t => t !== type)
        : [...prev.propertyTypes, type]
    }));
  }, []);

  const setCity = useCallback((city: string) => {
    setFilters(prev => ({ ...prev, city }));
  }, []);

  const setConsultantId = useCallback((consultantId: number | null) => {
    setFilters(prev => ({ ...prev, consultantId }));
  }, []);

  const setConstructionYearRange = useCallback((min: number | null, max: number | null) => {
    setFilters(prev => ({
      ...prev,
      constructionYearMin: min,
      constructionYearMax: max
    }));
  }, []);

  const setSortBy = useCallback((sortBy: SortField) => {
    setSort(prev => ({ ...prev, sortBy }));
  }, []);

  const setSortOrder = useCallback((sortOrder: SortOrder) => {
    setSort(prev => ({ ...prev, sortOrder }));
  }, []);

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize, page: 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
    setSort(defaultSort);
    setPagination(defaultPagination);
  }, []);

  // Calculs
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.propertyTypes.length > 0) count++;
    if (filters.city) count++;
    if (filters.consultantId) count++;
    if (filters.constructionYearMin || filters.constructionYearMax) count++;
    return count;
  }, [filters]);

  const hasActiveFilters = activeFiltersCount > 0;
  const hasSearch = filters.search.length > 0;

  return {
    // Donnees
    projects,
    total,
    totalPages,
    metadata,

    // Etat
    filters,
    sort,
    pagination,

    // Chargement
    loading,
    error,

    // Actions
    setSearch,
    setPropertyTypes,
    togglePropertyType,
    setCity,
    setConsultantId,
    setConstructionYearRange,
    setSort,
    setSortBy,
    setSortOrder,
    setPage,
    setPageSize,
    resetFilters,
    refetch: fetchProjects,

    // Calcules
    activeFiltersCount,
    hasActiveFilters,
    hasSearch,
  };
}
