import { useState, useEffect, useRef, useCallback } from "react";
import { Check, Loader2 } from "lucide-react";
import { SynthesisTable, computeTotals } from "./analysis/SynthesisTable";
import { RentalEstimation } from "./analysis/RentalEstimation";
import { SaleEstimation } from "./analysis/SaleEstimation";
import { ComparablesSidebar } from "./analysis/ComparablesSidebar";
import { PriceIndicators } from "./comparison/PriceIndicators";
import {
  getBreakdowns,
  bulkSaveBreakdowns,
  getEstimation,
  saveEstimation,
  getValidatedComparables,
} from "@/services/analysisService";
import { searchComparables } from "@/services/projectService";
import type { PropertyBreakdownInput, MarketEstimation } from "@/types/analysis";
import type { SelectedComparable, PerimeterStats } from "@/types/comparable";
import { DEFAULT_COMPARISON_FILTERS } from "@/types/comparable";

interface AnalysisStepProps {
  projectId: number;
  onStepComplete?: () => void;
  onGoToComparison?: () => void;
}

const DEFAULT_ESTIMATION: MarketEstimation = {
  id: 0,
  project_id: 0,
  sale_price_low: null,
  sale_price_high: null,
  sale_price_custom: null,
  sale_capitalization_rate: 8,
  rent_low: null,
  rent_high: null,
  rent_custom: null,
  rent_capitalization_rate: 8,
};

export function AnalysisStep({ projectId, onStepComplete, onGoToComparison }: AnalysisStepProps) {
  const [rows, setRows] = useState<PropertyBreakdownInput[]>([]);
  const [estimation, setEstimation] = useState<MarketEstimation>(DEFAULT_ESTIMATION);
  const [comparables, setComparables] = useState<SelectedComparable[]>([]);
  const [perimeterStats, setPerimeterStats] = useState<PerimeterStats[] | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dataLoadedRef = useRef(false);

  // Charger les données au montage
  useEffect(() => {
    if (!projectId) return;

    async function loadData() {
      setLoading(true);
      setStatsLoading(true);
      try {
        const [breakdownsData, estimationData, comparablesData, searchData] = await Promise.all([
          getBreakdowns(projectId).catch(() => []),
          getEstimation(projectId).catch(() => DEFAULT_ESTIMATION),
          getValidatedComparables(projectId).catch(() => []),
          searchComparables(projectId, DEFAULT_COMPARISON_FILTERS).catch(() => null),
        ]);

        if (searchData) setPerimeterStats(searchData.perimeter_stats);

        const mappedRows: PropertyBreakdownInput[] = breakdownsData.map((b) => ({
          id: b.id,
          local_type: b.local_type,
          surface: b.surface,
          price_per_m2: b.price_per_m2,
          rental_value_per_m2: b.rental_value_per_m2,
          venal_value_hd: b.venal_value_hd,
          rental_value_annual: b.rental_value_annual,
          rental_value_monthly: b.rental_value_monthly,
          is_venal_override: b.is_venal_override,
          is_rental_annual_override: b.is_rental_annual_override,
          is_rental_monthly_override: b.is_rental_monthly_override,
          order: b.order,
        }));

        setRows(mappedRows);
        setEstimation(estimationData);
        setComparables(comparablesData);
        dataLoadedRef.current = true;
      } catch (err) {
        console.error("Erreur chargement analyse:", err);
      } finally {
        setLoading(false);
        setStatsLoading(false);
      }
    }

    loadData();
  }, [projectId]);

  // Sauvegarde debounced
  const scheduleSave = useCallback(() => {
    if (!dataLoadedRef.current) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    setSaveStatus("saving");
    saveTimerRef.current = setTimeout(async () => {
      try {
        await Promise.all([
          bulkSaveBreakdowns(projectId, rows),
          saveEstimation(projectId, estimation),
        ]);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (err) {
        console.error("Erreur sauvegarde:", err);
        setSaveStatus("idle");
      }
    }, 1000);
  }, [projectId, rows, estimation]);

  // Déclencher la sauvegarde quand les données changent
  useEffect(() => {
    scheduleSave();
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [scheduleSave]);

  const handleRowsChange = (newRows: PropertyBreakdownInput[]) => {
    setRows(newRows);
  };

  const handleEstimationChange = (updates: Partial<MarketEstimation>) => {
    setEstimation((prev) => ({ ...prev, ...updates }));
  };

  const totals = computeTotals(rows);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
        <span className="text-gray-500">Chargement de l'analyse...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bandeau d'indicateurs de prix - 3 périmètres */}
      <PriceIndicators perimeterStats={perimeterStats} loading={statsLoading} />

      {/* Indicateur de sauvegarde */}
      <div className="flex justify-end">
        {saveStatus === "saving" && (
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            <Loader2 className="w-3 h-3 animate-spin" />
            Sauvegarde en cours...
          </span>
        )}
        {saveStatus === "saved" && (
          <span className="flex items-center gap-1.5 text-xs text-green-600">
            <Check className="w-3 h-3" />
            Sauvegardé
          </span>
        )}
      </div>

      {/* Tableau de Synthèse (pleine largeur) */}
      <SynthesisTable rows={rows} onChange={handleRowsChange} />

      {/* Layout 2 colonnes : contenu principal + sidebar comparables */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-7 space-y-6">
          <RentalEstimation estimation={estimation} onChange={handleEstimationChange} />
          <SaleEstimation
            estimation={estimation}
            totalSurface={totals.surface}
            onChange={handleEstimationChange}
          />
        </div>

        {/* Sidebar comparables */}
        <div className="lg:col-span-3">
          <div className="sticky top-4">
            <ComparablesSidebar
              comparables={comparables}
              onGoToComparison={onGoToComparison}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
