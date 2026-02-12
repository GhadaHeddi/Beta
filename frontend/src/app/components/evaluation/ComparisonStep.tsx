import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  ComparisonFilters,
  PriceIndicators,
  ComparableMap,
  ComparisonTable,
  SelectedComparablesList,
  QuickAddForm,
} from './comparison';
import {
  searchComparables,
  getSelectedComparables,
  selectComparable,
  deselectComparable,
  validateComparables,
  updateComparableFields,
} from '@/services/projectService';
import type {
  ComparisonFilters as FiltersType,
  ComparableSearchResponse,
  SelectedComparable,
  ComparablePool,
  EvaluatedProperty,
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
  status: 'all',
};

export function ComparisonStep({ projectId, evaluatedProperty, onStepComplete }: Props) {
  const [filters, setFilters] = useState<FiltersType>(DEFAULT_FILTERS);
  const [searchResults, setSearchResults] = useState<ComparableSearchResponse | null>(null);
  // Biens affiches dans le tableau de comparaison
  const [comparedItems, setComparedItems] = useState<SelectedComparable[]>([]);
  // Biens gardes pour la suite (selection finale, donnees completes)
  const [finalItems, setFinalItems] = useState<SelectedComparable[]>([]);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchComparables();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [filters, projectId]);

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
      setComparedItems(selected);
      setFinalItems(selected);
    } catch (error) {
      console.error('Erreur chargement comparables selectionnes:', error);
    }
  };

  // Clic sur marker carte = ajouter/retirer du tableau de comparaison
  const handleMarkerClick = async (comparable: ComparablePool) => {
    const existing = comparedItems.find(
      (c) => c.source_reference === String(comparable.id)
    );

    if (existing) {
      handleRemoveFromTable(existing.id);
      return;
    }

    try {
      const selected = await selectComparable(projectId, comparable.id);
      setComparedItems((prev) => [...prev, selected]);
      toast.success('Comparable ajoute a la comparaison');
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'ajout");
    }
  };

  // Retirer du tableau de comparaison SEULEMENT (garde dans la selection finale)
  const handleRemoveFromTable = (id: number) => {
    setComparedItems((prev) => prev.filter((c) => c.id !== id));
  };

  // Selectionner un bien pour la suite (copie dans finalItems)
  const handleToggleSelect = (id: number) => {
    const alreadySelected = finalItems.some((f) => f.id === id);
    if (alreadySelected) {
      setFinalItems((prev) => prev.filter((f) => f.id !== id));
    } else {
      const item = comparedItems.find((c) => c.id === id);
      if (item) {
        setFinalItems((prev) => [...prev, item]);
      }
    }
  };

  // Selectionner tous les biens du tableau
  const handleSelectAll = () => {
    const comparedIds = comparedItems.map((c) => c.id);
    const allSelected = comparedIds.every((id) => finalItems.some((f) => f.id === id));
    if (allSelected) {
      setFinalItems((prev) => prev.filter((f) => !comparedIds.includes(f.id)));
    } else {
      setFinalItems((prev) => {
        const existingIds = prev.map((f) => f.id);
        const newItems = comparedItems.filter((c) => !existingIds.includes(c.id));
        return [...prev, ...newItems];
      });
    }
  };

  // Retirer definitivement de la selection finale
  const handleRemoveFromFinal = async (id: number) => {
    try {
      await deselectComparable(projectId, id);
      setFinalItems((prev) => prev.filter((f) => f.id !== id));
      setComparedItems((prev) => prev.filter((c) => c.id !== id));
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  // Remettre les biens selectionnes dans le tableau de comparaison
  const handleRecompare = () => {
    setComparedItems((prev) => {
      const existingIds = prev.map((c) => c.id);
      const toAdd = finalItems.filter((f) => !existingIds.includes(f.id));
      return [...prev, ...toAdd];
    });
    toast.success('Biens selectionnes remis en comparaison');
  };

  // Valider et passer a l'etape suivante
  const handleValidate = async () => {
    if (finalItems.length === 0) {
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

  // Mise a jour des champs d'un comparable (edition inline)
  const handleUpdateComparable = async (id: number, fields: { surface?: number; price?: number; price_per_m2?: number; construction_year?: number }) => {
    try {
      const updated = await updateComparableFields(projectId, id, fields);
      const updateItem = (item: SelectedComparable) =>
        item.id === id ? { ...item, ...updated } : item;
      setComparedItems((prev) => prev.map(updateItem));
      setFinalItems((prev) => prev.map(updateItem));
      toast.success('Valeur mise a jour');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise a jour');
    }
  };

  // Callback apres ajout rapide
  const handleQuickAddSuccess = () => {
    fetchComparables();
  };

  // IDs des comparables dans le tableau (pour surligner sur la carte)
  const comparedIds = comparedItems.map((c) =>
    c.source_reference ? parseInt(c.source_reference) : 0
  );

  const finalSelectionIds = finalItems.map((f) => f.id);

  return (
    <div className="space-y-6">
      {/* Bandeau d'indicateurs de prix - 3 perimetres */}
      <PriceIndicators
        perimeterStats={searchResults?.perimeter_stats || null}
        loading={loading}
      />

      {/* Layout 3 colonnes : Ajout rapide | Carte | Filtres */}
      <div className="flex gap-4">
        {/* Colonne gauche - Ajout rapide */}
        <div className="w-[250px] shrink-0">
          <QuickAddForm
            projectId={projectId}
            onAdded={handleQuickAddSuccess}
          />
        </div>

        {/* Colonne centre - Carte */}
        <div className="flex-1 min-w-0">
          <ComparableMap
            center={searchResults?.center || null}
            comparables={searchResults?.comparables || []}
            selectedIds={comparedIds}
            distanceKm={filters.distanceKm}
            onMarkerClick={handleMarkerClick}
          />
        </div>

        {/* Colonne droite - Filtres */}
        <div className="w-[280px] shrink-0">
          <ComparisonFilters
            filters={filters}
            onFiltersChange={setFilters}
            onReset={handleResetFilters}
          />
        </div>
      </div>

      {/* Tableau de comparaison */}
      <ComparisonTable
        evaluatedProperty={evaluatedProperty}
        selectedComparables={comparedItems}
        onRemove={handleRemoveFromTable}
        onSelect={handleToggleSelect}
        onSelectAll={handleSelectAll}
        finalSelection={finalSelectionIds}
        onUpdate={handleUpdateComparable}
      />

      {/* Liste des biens selectionnes */}
      <SelectedComparablesList
        items={finalItems}
        onRemove={handleRemoveFromFinal}
        onRecompare={handleRecompare}
        onValidate={handleValidate}
        loading={validating}
      />
    </div>
  );
}
