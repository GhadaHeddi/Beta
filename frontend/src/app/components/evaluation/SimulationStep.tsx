import {
  Calculator,
  TrendingUp,
  Home,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Check,
  Loader2,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { PriceIndicators } from "./comparison/PriceIndicators";
import { searchComparables } from "@/services/projectService";
import {
  getSimulations,
  createSimulation,
  updateSimulation,
  deleteSimulation,
  computeSimulationOutputs,
} from "@/services/simulationService";
import type {
  Simulation,
  SimulationInputData,
  SimulationOutputData,
} from "@/types/simulation";
import { DEFAULT_SIMULATION_INPUT } from "@/types/simulation";
import type { PerimeterStats } from "@/types/comparable";
import { DEFAULT_COMPARISON_FILTERS } from "@/types/comparable";

interface SimulationStepProps {
  projectId: number;
  onStepComplete?: () => void;
}

// Local state for a simulation (includes computed outputs for instant reactivity)
interface LocalSimulation {
  id: number;
  name: string;
  simulation_type: string;
  input_data: SimulationInputData;
  output_data: SimulationOutputData;
  notes: string | null;
  selected: boolean;
  expanded: boolean;
}

const INPUT_CLASSES =
  "w-24 px-3 py-2 text-xs text-right font-medium bg-gray-50/60 backdrop-blur-sm border border-gray-200/50 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-300 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

const SLIDER_CLASSES =
  "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-900";

function formatEuro(value: number): string {
  return value.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " \u20AC";
}

export function SimulationStep({ projectId, onStepComplete }: SimulationStepProps) {
  const [simulations, setSimulations] = useState<LocalSimulation[]>([]);
  const [perimeterStats, setPerimeterStats] = useState<PerimeterStats[] | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dataLoadedRef = useRef(false);
  // Track which simulation IDs have pending saves
  const pendingSavesRef = useRef<Set<number>>(new Set());

  // Load data on mount
  useEffect(() => {
    if (!projectId) return;

    async function loadData() {
      setLoading(true);
      setStatsLoading(true);
      try {
        const [simsData, searchData] = await Promise.all([
          getSimulations(projectId).catch(() => []),
          searchComparables(projectId, DEFAULT_COMPARISON_FILTERS).catch(() => null),
        ]);

        const localSims: LocalSimulation[] = simsData.map((s: Simulation, i: number) => ({
          id: s.id,
          name: s.name,
          simulation_type: s.simulation_type,
          input_data: s.input_data,
          output_data: computeSimulationOutputs(s.input_data),
          notes: s.notes,
          selected: s.selected,
          expanded: i === 0, // first one expanded
        }));

        setSimulations(localSims);
        if (searchData) setPerimeterStats(searchData.perimeter_stats);
        dataLoadedRef.current = true;
      } catch (err) {
        console.error("Erreur chargement simulations:", err);
      } finally {
        setLoading(false);
        setStatsLoading(false);
      }
    }

    loadData();
  }, [projectId]);

  // Debounced save for a specific simulation
  const scheduleSave = useCallback(
    (simId: number) => {
      if (!dataLoadedRef.current) return;

      pendingSavesRef.current.add(simId);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

      setSaveStatus("saving");
      saveTimerRef.current = setTimeout(async () => {
        const idsToSave = Array.from(pendingSavesRef.current);
        pendingSavesRef.current.clear();

        try {
          // Save all pending simulations
          await Promise.all(
            idsToSave.map((id) => {
              const sim = simulations.find((s) => s.id === id);
              if (!sim) return Promise.resolve();
              const output = computeSimulationOutputs(sim.input_data);
              return updateSimulation(projectId, id, {
                name: sim.name,
                input_data: sim.input_data,
                output_data: output,
                notes: sim.notes,
                selected: sim.selected,
              });
            })
          );
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2000);
        } catch (err) {
          console.error("Erreur sauvegarde simulation:", err);
          setSaveStatus("idle");
        }
      }, 1000);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projectId, simulations]
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  // Update a simulation's input field
  const updateInputField = (simId: number, field: keyof SimulationInputData, value: number) => {
    setSimulations((prev) =>
      prev.map((s) => {
        if (s.id !== simId) return s;
        const newInput = { ...s.input_data, [field]: value };
        return {
          ...s,
          input_data: newInput,
          output_data: computeSimulationOutputs(newInput),
        };
      })
    );
    // Schedule save after state update
    setTimeout(() => scheduleSave(simId), 0);
  };

  // Toggle selected
  const toggleSelected = (simId: number) => {
    setSimulations((prev) =>
      prev.map((s) =>
        s.id === simId ? { ...s, selected: !s.selected } : s
      )
    );
    setTimeout(() => scheduleSave(simId), 0);
  };

  // Toggle expanded
  const toggleExpanded = (simId: number) => {
    setSimulations((prev) =>
      prev.map((s) =>
        s.id === simId ? { ...s, expanded: !s.expanded } : s
      )
    );
  };

  // Create new simulation
  const handleCreate = async () => {
    try {
      const output = computeSimulationOutputs(DEFAULT_SIMULATION_INPUT);
      const created = await createSimulation(projectId, {
        name: `Simulation ${simulations.length + 1}`,
        simulation_type: "autre",
        input_data: DEFAULT_SIMULATION_INPUT,
        output_data: output,
      });
      setSimulations((prev) => [
        ...prev,
        {
          id: created.id,
          name: created.name,
          simulation_type: created.simulation_type,
          input_data: created.input_data,
          output_data: computeSimulationOutputs(created.input_data),
          notes: created.notes,
          selected: created.selected,
          expanded: true,
        },
      ]);
    } catch (err) {
      console.error("Erreur création simulation:", err);
    }
  };

  // Delete simulation
  const handleDelete = async (simId: number) => {
    try {
      await deleteSimulation(projectId, simId);
      setSimulations((prev) => prev.filter((s) => s.id !== simId));
    } catch (err) {
      console.error("Erreur suppression simulation:", err);
    }
  };

  // Update simulation name
  const updateName = (simId: number, name: string) => {
    setSimulations((prev) =>
      prev.map((s) => (s.id === simId ? { ...s, name } : s))
    );
    setTimeout(() => scheduleSave(simId), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-500">Chargement des simulations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Price Indicators */}
      <PriceIndicators perimeterStats={perimeterStats} loading={statsLoading} />

      {/* Header: new simulation button + save status */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nouvelle simulation
        </button>

        <div className="flex items-center gap-2">
          {saveStatus === "saving" && (
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <Loader2 className="w-3 h-3 animate-spin" />
              Sauvegarde en cours...
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1.5 text-xs text-green-600">
              <Check className="w-3 h-3" />
              Sauvegard{"é"}
            </span>
          )}
        </div>
      </div>

      {/* Simulations list */}
      {simulations.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Calculator className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Aucune simulation. Cliquez sur "Nouvelle simulation" pour commencer.</p>
        </div>
      )}

      {simulations.map((sim) => (
        <SimulationCard
          key={sim.id}
          sim={sim}
          onToggleExpanded={() => toggleExpanded(sim.id)}
          onToggleSelected={() => toggleSelected(sim.id)}
          onDelete={() => handleDelete(sim.id)}
          onUpdateInput={(field, value) => updateInputField(sim.id, field, value)}
          onUpdateName={(name) => updateName(sim.id, name)}
        />
      ))}
    </div>
  );
}

// === Simulation Card ===

interface SimulationCardProps {
  sim: LocalSimulation;
  onToggleExpanded: () => void;
  onToggleSelected: () => void;
  onDelete: () => void;
  onUpdateInput: (field: keyof SimulationInputData, value: number) => void;
  onUpdateName: (name: string) => void;
}

function SimulationCard({
  sim,
  onToggleExpanded,
  onToggleSelected,
  onDelete,
  onUpdateInput,
  onUpdateName,
}: SimulationCardProps) {
  const { input_data: input, output_data: output } = sim;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 border-b border-gray-200">
        <button onClick={onToggleExpanded} className="text-gray-500 hover:text-gray-700">
          {sim.expanded ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </button>

        <input
          type="text"
          value={sim.name}
          onChange={(e) => onUpdateName(e.target.value)}
          className="text-sm font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 flex-1 min-w-0"
        />

        <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer whitespace-nowrap">
          <input
            type="checkbox"
            checked={sim.selected}
            onChange={onToggleSelected}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Inclure dans le rapport
        </label>

        <button
          onClick={onDelete}
          className="text-gray-400 hover:text-red-500 transition-colors ml-2"
          title="Supprimer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Body (collapsible) */}
      {sim.expanded && (
        <div className="grid grid-cols-3 gap-6 p-5">
          {/* Col 1: Travaux et Apport + Calcul */}
          <div className="space-y-4">
            {/* Travaux et Apport */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Home className="w-5 h-5 text-blue-900" />
                <h4 className="text-base text-gray-900 font-medium">Travaux et Apport</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Prix du bien</span>
                  <input
                    type="number"
                    value={input.property_price}
                    onChange={(e) => onUpdateInput("property_price", Number(e.target.value))}
                    className={INPUT_CLASSES}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Travaux estimés</span>
                  <input
                    type="number"
                    value={input.works_amount}
                    onChange={(e) => onUpdateInput("works_amount", Number(e.target.value))}
                    className={INPUT_CLASSES}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Apport personnel</span>
                  <input
                    type="number"
                    value={input.personal_contribution}
                    onChange={(e) => onUpdateInput("personal_contribution", Number(e.target.value))}
                    className={INPUT_CLASSES}
                  />
                </div>
              </div>
            </div>

            {/* Calcul (frais notaire etc.) */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-base text-gray-900 font-medium mb-3">Frais de Notaires</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Taux frais de notaire</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={input.notary_rate}
                      onChange={(e) => onUpdateInput("notary_rate", Number(e.target.value))}
                      className={INPUT_CLASSES + " w-16"}
                      step="0.1"
                    />
                    <span className="text-xs text-gray-500">%</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Frais de notaire</span>
                  <span className="font-medium text-gray-900">{formatEuro(output.notary_fees)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total avec frais</span>
                  <span className="font-medium text-gray-900">{formatEuro(output.total_with_fees)}</span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Prix avec frais et travaux</span>
                    <span className="font-semibold text-blue-900">{formatEuro(output.price_with_fees_and_works)}</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">À financer</span>
                  <span className="text-lg font-bold text-blue-900">{formatEuro(output.amount_to_finance)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Col 2: Financement + Capacité d'Emprunt */}
          <div className="space-y-4">
            {/* Financement */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5 text-blue-900" />
                <h4 className="text-base text-gray-900 font-medium">Financement</h4>
              </div>
              <div className="space-y-2">
                {/* Montant */}
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-600">Montant</label>
                  <input
                    type="number"
                    value={input.loan_amount}
                    onChange={(e) => onUpdateInput("loan_amount", Number(e.target.value))}
                    className={INPUT_CLASSES + " w-20"}
                  />
                </div>
                <input
                  type="range"
                  min="100000"
                  max="5000000"
                  step="50000"
                  value={input.loan_amount}
                  onChange={(e) => onUpdateInput("loan_amount", Number(e.target.value))}
                  className={SLIDER_CLASSES}
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>100 000 €</span>
                  <span>5 000 000 €</span>
                </div>

                {/* Taux */}
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-600">Taux</label>
                  <input
                    type="number"
                    value={input.interest_rate}
                    onChange={(e) => onUpdateInput("interest_rate", Number(e.target.value))}
                    className={INPUT_CLASSES + " w-20"}
                    step="0.1"
                  />
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="6"
                  step="0.1"
                  value={input.interest_rate}
                  onChange={(e) => onUpdateInput("interest_rate", Number(e.target.value))}
                  className={SLIDER_CLASSES}
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>0.5%</span>
                  <span>6%</span>
                </div>

                {/* Assurance */}
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-600">Assurance</label>
                  <input
                    type="number"
                    value={input.insurance_rate}
                    onChange={(e) => onUpdateInput("insurance_rate", Number(e.target.value))}
                    className={INPUT_CLASSES + " w-20"}
                    step="0.05"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={input.insurance_rate}
                  onChange={(e) => onUpdateInput("insurance_rate", Number(e.target.value))}
                  className={SLIDER_CLASSES}
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>0%</span>
                  <span>1%</span>
                </div>

                {/* Durée */}
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-600">Durée (ans)</label>
                  <input
                    type="number"
                    value={input.loan_duration_years}
                    onChange={(e) => onUpdateInput("loan_duration_years", Number(e.target.value))}
                    className={INPUT_CLASSES + " w-20"}
                  />
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={input.loan_duration_years}
                  onChange={(e) => onUpdateInput("loan_duration_years", Number(e.target.value))}
                  className={SLIDER_CLASSES}
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>5 ans</span>
                  <span>30 ans</span>
                </div>

                {/* Résultat mensualité */}
                <div className="pt-2 mt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-600">Mensualité totale</p>
                  <p className="text-2xl text-blue-900 font-bold">{formatEuro(output.monthly_payment)}</p>
                </div>
              </div>
            </div>

            {/* Capacité d'Emprunt */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-900" />
                <h4 className="text-base text-gray-900 font-medium">Capacité d'Emprunt</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Revenus mensuels</span>
                  <input
                    type="number"
                    value={input.monthly_income}
                    onChange={(e) => onUpdateInput("monthly_income", Number(e.target.value))}
                    className={INPUT_CLASSES}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Charges mensuelles</span>
                  <input
                    type="number"
                    value={input.monthly_charges}
                    onChange={(e) => onUpdateInput("monthly_charges", Number(e.target.value))}
                    className={INPUT_CLASSES}
                  />
                </div>
                <div className="pt-2 mt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-600">Capacité totale</p>
                  <p className="text-2xl text-green-600 font-bold">{formatEuro(output.borrowing_capacity)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Col 3: Reserved for future content */}
          <div />
        </div>
      )}
    </div>
  );
}
