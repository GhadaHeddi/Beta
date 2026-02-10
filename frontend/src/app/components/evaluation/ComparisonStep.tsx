import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  ComparisonFilters,
  PriceIndicators,
  ComparableMap,
  ComparisonTable,
  ComparisonValidation,
} from './comparison';
import {
  searchComparables,
  getSelectedComparables,
  selectComparable,
  deselectComparable,
  validateComparables,
} from '@/services/projectService';
import type {
  ComparisonFilters as FiltersType,
  ComparableSearchResponse,
  SelectedComparable,
  ComparablePool,
  EvaluatedProperty,
  DEFAULT_COMPARISON_FILTERS,
} from '@/types/comparable';

interface Props {
  projectId: number;
  evaluatedProperty: EvaluatedProperty;
  onStepComplete?: () => void;
}

const DEFAULT_FILTERS: FiltersType = {
  surfaceMin: null,
  surfaceMax: null,
  yearMin: null,
  yearMax: null,
  distanceKm: 5,
  source: 'all',
};

export function ComparisonStep({ projectId, evaluatedProperty, onStepComplete }: Props) {
  // State
  const [filters, setFilters] = useState<FiltersType>(DEFAULT_FILTERS);
  const [searchResults, setSearchResults] = useState<ComparableSearchResponse | null>(null);
  const [selectedComparables, setSelectedComparables] = useState<SelectedComparable[]>([]);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);

  // Fetch comparables with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchComparables();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters, projectId]);

  // Load selected comparables on mount
  useEffect(() => {
    loadSelectedComparables();
  }, [projectId]);

  const fetchComparables = async () => {
    if (!projectId) return;

    setLoading(true);
    try {
      const results = await searchComparables(projectId, filters);
      setSearchResults(results);
    } catch (error) {
      console.error('Erreur recherche comparables:', error);
      toast.error('Erreur lors de la recherche des comparables');
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedComparables = async () => {
    if (!projectId) return;

    try {
      const selected = await getSelectedComparables(projectId);
      setSelectedComparables(selected);
    } catch (error) {
      console.error('Erreur chargement comparables selectionnes:', error);
    }
  };

  const handleMarkerClick = async (comparable: ComparablePool) => {
    // Verifier si deja selectionne - si oui, deselectionner
    const existing = selectedComparables.find(
      (c) => c.source_reference === String(comparable.id)
    );

    if (existing) {
      await handleRemoveComparable(existing.id);
      return;
    }

    // Verifier limite max 3
    if (selectedComparables.length >= 3) {
      toast.warning('Maximum 3 comparables. Deselectionnez-en un d\'abord.');
      return;
    }

    try {
      const selected = await selectComparable(projectId, comparable.id);
      setSelectedComparables([...selectedComparables, selected]);
      toast.success('Comparable ajoute');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la selection');
    }
  };

  const handleRemoveComparable = async (id: number) => {
    try {
      await deselectComparable(projectId, id);
      setSelectedComparables(selectedComparables.filter((c) => c.id !== id));
      toast.success('Comparable retire');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  const handleAdjustmentChange = (id: number, adjustment: number) => {
    setSelectedComparables(
      selectedComparables.map((c) =>
        c.id === id
          ? {
              ...c,
              adjustment,
              adjusted_price_per_m2: Math.round(c.price_per_m2 * (1 + adjustment / 100)),
            }
          : c
      )
    );
  };

  const handleValidate = async () => {
    if (selectedComparables.length === 0) {
      toast.error('Selectionnez au moins un comparable');
      return;
    }

    setValidating(true);
    try {
      await validateComparables(projectId);
      toast.success('Comparables valides avec succes');
      onStepComplete?.();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la validation');
    } finally {
      setValidating(false);
    }
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  // IDs des comparables selectionnes (pour la carte)
  const selectedIds = selectedComparables.map((c) =>
    c.source_reference ? parseInt(c.source_reference) : 0
  );

  return (
    <div className="space-y-6">
      {/* Indicateurs de prix */}
      <PriceIndicators stats={searchResults?.stats || null} loading={loading} />

      {/* Filtres a gauche + Carte a droite */}
      <div className="flex gap-4">
        <div className="w-[280px] shrink-0">
          <ComparisonFilters
            filters={filters}
            onFiltersChange={setFilters}
            onReset={handleResetFilters}
          />
        </div>

        <div className="flex-1 min-w-0">
          <ComparableMap
            center={searchResults?.center || null}
            comparables={searchResults?.comparables || []}
            selectedIds={selectedIds}
            distanceKm={filters.distanceKm}
            onMarkerClick={handleMarkerClick}
          />
        </div>
      </div>

      {/* Tableau de comparaison */}
      <ComparisonTable
        evaluatedProperty={evaluatedProperty}
        selectedComparables={selectedComparables}
        onAdjustmentChange={handleAdjustmentChange}
        onRemove={handleRemoveComparable}
      />

      {/* Bouton de validation */}
      <ComparisonValidation
        selectedCount={selectedComparables.length}
        onValidate={handleValidate}
        loading={validating}
      />
    </div>
  );
}
