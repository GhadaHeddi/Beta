import { Plus, Trash2, Building2, Store, Warehouse, Factory, LandPlot, LayoutGrid, AlertCircle } from "lucide-react";
import type { PropertyBreakdownInput, LocalType, SynthesisTotals } from "@/types/analysis";

const LOCAL_TYPES: { value: LocalType; label: string; icon: React.ElementType }[] = [
  { value: "Bureaux", label: "Bureaux", icon: Building2 },
  { value: "Commerce", label: "Commerce", icon: Store },
  { value: "Entrepôt", label: "Entrepôt", icon: Warehouse },
  { value: "Local d'activité", label: "Local d'activité", icon: Factory },
  { value: "Terrain", label: "Terrain", icon: LandPlot },
  { value: "Autre", label: "Autre", icon: LayoutGrid },
];

function getIconForType(type: LocalType) {
  const found = LOCAL_TYPES.find((t) => t.value === type);
  if (!found) return LayoutGrid;
  return found.icon;
}

function formatNumber(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return "";
  return Math.round(value).toLocaleString("fr-FR");
}

interface SynthesisTableProps {
  rows: PropertyBreakdownInput[];
  onChange: (rows: PropertyBreakdownInput[]) => void;
}

export function SynthesisTable({ rows, onChange }: SynthesisTableProps) {
  const totals = computeTotals(rows);

  function handleAddRow() {
    const newRow: PropertyBreakdownInput = {
      local_type: "Bureaux",
      surface: 0,
      price_per_m2: null,
      rental_value_per_m2: null,
      venal_value_hd: null,
      rental_value_annual: null,
      rental_value_monthly: null,
      is_venal_override: false,
      is_rental_annual_override: false,
      is_rental_monthly_override: false,
      order: rows.length,
    };
    onChange([...rows, newRow]);
  }

  function handleRemoveRow(index: number) {
    onChange(rows.filter((_, i) => i !== index));
  }

  function handleFieldChange(index: number, field: keyof PropertyBreakdownInput, value: unknown) {
    const updated = [...rows];
    const row = { ...updated[index] };

    if (field === "local_type") {
      row.local_type = value as LocalType;
    } else if (field === "surface" || field === "price_per_m2" || field === "rental_value_per_m2") {
      (row as Record<string, unknown>)[field] = value === "" ? null : Number(value);
      // Recalculate auto fields if not overridden
      const surface = field === "surface" ? Number(value) || 0 : row.surface || 0;
      const priceM2 = field === "price_per_m2" ? Number(value) || 0 : row.price_per_m2 || 0;
      const rentalM2 = field === "rental_value_per_m2" ? Number(value) || 0 : row.rental_value_per_m2 || 0;

      if (!row.is_venal_override) {
        row.venal_value_hd = surface * priceM2;
      }
      if (!row.is_rental_annual_override) {
        row.rental_value_annual = surface * rentalM2;
      }
      if (!row.is_rental_monthly_override) {
        row.rental_value_monthly = (surface * rentalM2) / 12;
      }
    } else if (field === "venal_value_hd") {
      row.venal_value_hd = value === "" ? null : Number(value);
      row.is_venal_override = value !== "" && value != null;
    } else if (field === "rental_value_annual") {
      row.rental_value_annual = value === "" ? null : Number(value);
      row.is_rental_annual_override = value !== "" && value != null;
      if (!row.is_rental_monthly_override && row.rental_value_annual != null) {
        row.rental_value_monthly = row.rental_value_annual / 12;
      }
    } else if (field === "rental_value_monthly") {
      row.rental_value_monthly = value === "" ? null : Number(value);
      row.is_rental_monthly_override = value !== "" && value != null;
    }

    updated[index] = row;
    onChange(updated);
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg text-gray-900 font-medium">Tableau de Synthèse</h3>
        <button
          onClick={handleAddRow}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
        >
          <Plus className="w-4 h-4" />
          Ajouter une ligne
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: "#1e3a5f" }} className="text-white">
              <th className="text-left py-3 px-4 text-sm font-medium">Type</th>
              <th className="text-center py-3 px-4 text-sm font-medium">Surface</th>
              <th className="text-right py-3 px-4 text-sm font-medium">Prix/m²</th>
              <th className="text-right py-3 px-4 text-sm font-medium">V. Locative/m²</th>
              <th className="text-right py-3 px-4 text-sm font-medium">V. Vénale HD</th>
              <th className="text-right py-3 px-4 text-sm font-medium">V. Locative/an</th>
              <th className="text-right py-3 px-4 text-sm font-medium">V. Locative/mois</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const Icon = getIconForType(row.local_type);
              return (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  {/* Type */}
                  <td className="py-2 px-4">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-500 shrink-0" />
                      <select
                        value={row.local_type}
                        onChange={(e) => handleFieldChange(index, "local_type", e.target.value)}
                        className="text-sm border border-gray-200 rounded px-2 py-1 bg-white"
                      >
                        {LOCAL_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                  {/* Surface */}
                  <td className="py-2 px-4">
                    <input
                      type="number"
                      value={row.surface || ""}
                      onChange={(e) => handleFieldChange(index, "surface", e.target.value)}
                      className="w-24 text-sm text-center border border-gray-200 rounded px-2 py-1 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      placeholder="m²"
                    />
                  </td>
                  {/* Prix/m² */}
                  <td className="py-2 px-4">
                    <input
                      type="number"
                      value={row.price_per_m2 ?? ""}
                      onChange={(e) => handleFieldChange(index, "price_per_m2", e.target.value)}
                      className="w-24 text-sm text-right border border-gray-200 rounded px-2 py-1 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      placeholder="€"
                    />
                  </td>
                  {/* V. Locative/m² */}
                  <td className="py-2 px-4">
                    <input
                      type="number"
                      value={row.rental_value_per_m2 ?? ""}
                      onChange={(e) => handleFieldChange(index, "rental_value_per_m2", e.target.value)}
                      className="w-24 text-sm text-right border border-gray-200 rounded px-2 py-1 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      placeholder="€"
                    />
                  </td>
                  {/* V. Vénale HD (auto-calculé, overridable) */}
                  <td className="py-2 px-4">
                    <div className="relative">
                      <input
                        type="number"
                        value={row.venal_value_hd ?? ""}
                        onChange={(e) => handleFieldChange(index, "venal_value_hd", e.target.value)}
                        className={`w-28 text-sm text-right border rounded px-2 py-1 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                          row.is_venal_override ? "border-amber-300 bg-amber-50" : "border-gray-200"
                        }`}
                        placeholder="€"
                      />
                      {row.is_venal_override && (
                        <AlertCircle className="absolute -top-1 -right-1 w-3 h-3 text-amber-500" title="Valeur modifiée manuellement" />
                      )}
                    </div>
                  </td>
                  {/* V. Locative/an (auto-calculé, overridable) */}
                  <td className="py-2 px-4">
                    <div className="relative">
                      <input
                        type="number"
                        value={row.rental_value_annual ?? ""}
                        onChange={(e) => handleFieldChange(index, "rental_value_annual", e.target.value)}
                        className={`w-28 text-sm text-right border rounded px-2 py-1 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                          row.is_rental_annual_override ? "border-amber-300 bg-amber-50" : "border-gray-200"
                        }`}
                        placeholder="€"
                      />
                      {row.is_rental_annual_override && (
                        <AlertCircle className="absolute -top-1 -right-1 w-3 h-3 text-amber-500" title="Valeur modifiée manuellement" />
                      )}
                    </div>
                  </td>
                  {/* V. Locative/mois (auto-calculé, overridable) */}
                  <td className="py-2 px-4">
                    <div className="relative">
                      <input
                        type="number"
                        value={row.rental_value_monthly != null ? Math.round(row.rental_value_monthly) : ""}
                        onChange={(e) => handleFieldChange(index, "rental_value_monthly", e.target.value)}
                        className={`w-28 text-sm text-right border rounded px-2 py-1 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                          row.is_rental_monthly_override ? "border-amber-300 bg-amber-50" : "border-gray-200"
                        }`}
                        placeholder="€"
                      />
                      {row.is_rental_monthly_override && (
                        <AlertCircle className="absolute -top-1 -right-1 w-3 h-3 text-amber-500" title="Valeur modifiée manuellement" />
                      )}
                    </div>
                  </td>
                  {/* Supprimer */}
                  <td className="py-2 px-2">
                    <button
                      onClick={() => handleRemoveRow(index)}
                      className="text-gray-400 hover:text-red-500 transition p-1"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {/* Ligne TOTAUX */}
            <tr style={{ backgroundColor: "#c0392b" }} className="text-white font-semibold">
              <td className="py-4 px-4 text-sm">TOTAUX</td>
              <td className="py-4 px-4 text-sm text-center">{formatNumber(totals.surface)} m²</td>
              <td className="py-4 px-4 text-sm text-right">{formatNumber(totals.price_per_m2)} €</td>
              <td className="py-4 px-4 text-sm text-right">{formatNumber(totals.rental_value_per_m2)} €</td>
              <td className="py-4 px-4 text-base font-bold text-right">{formatNumber(totals.venal_value_hd)} €</td>
              <td className="py-4 px-4 text-base font-bold text-right">{formatNumber(totals.rental_value_annual)} €</td>
              <td className="py-4 px-4 text-base font-bold text-right">{formatNumber(totals.rental_value_monthly)} €</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function computeTotals(rows: PropertyBreakdownInput[]): SynthesisTotals {
  const totalSurface = rows.reduce((sum, r) => sum + (r.surface || 0), 0);
  const totalVenal = rows.reduce((sum, r) => sum + (r.venal_value_hd || 0), 0);
  const totalRentalAn = rows.reduce((sum, r) => sum + (r.rental_value_annual || 0), 0);
  const totalRentalMois = rows.reduce((sum, r) => sum + (r.rental_value_monthly || 0), 0);

  const avgPriceM2 = totalSurface > 0
    ? rows.reduce((sum, r) => sum + (r.price_per_m2 || 0) * (r.surface || 0), 0) / totalSurface
    : 0;
  const avgRentalM2 = totalSurface > 0
    ? rows.reduce((sum, r) => sum + (r.rental_value_per_m2 || 0) * (r.surface || 0), 0) / totalSurface
    : 0;

  return {
    surface: totalSurface,
    price_per_m2: avgPriceM2,
    rental_value_per_m2: avgRentalM2,
    venal_value_hd: totalVenal,
    rental_value_annual: totalRentalAn,
    rental_value_monthly: totalRentalMois,
  };
}
