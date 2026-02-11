import type { MarketEstimation } from "@/types/analysis";

function formatNumber(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return "0";
  return Math.round(value).toLocaleString("fr-FR");
}

interface SaleEstimationProps {
  estimation: MarketEstimation;
  totalSurface: number;
  onChange: (updates: Partial<MarketEstimation>) => void;
}

export function SaleEstimation({ estimation, totalSurface, onChange }: SaleEstimationProps) {
  const rentValue = estimation.rent_custom ?? estimation.rent_high ?? 0;
  const rate = estimation.rent_capitalization_rate || 8;
  const pricePerM2 = rate > 0 ? rentValue / (rate / 100) : 0;
  const totalPrice = pricePerM2 * totalSurface;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg text-gray-900 mb-4 font-medium">
        Loyer Constaté → Prix de Vente Estimé
      </h3>

      <div className="grid grid-cols-3 gap-6">
        {/* Loyer Constaté */}
        <div>
          <p className="text-sm text-gray-600 mb-2">Loyer Constaté</p>
          <div className="space-y-2">
            {/* Fourchette Basse */}
            <div className="w-full py-2 px-3 rounded border bg-gray-50 border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Fourchette Basse</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={estimation.rent_low ?? ""}
                    onChange={(e) => onChange({ rent_low: e.target.value ? Number(e.target.value) : null })}
                    className="w-24 text-right text-sm bg-transparent outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    placeholder="€/m²/an"
                  />
                  <span className="text-sm text-gray-500">€</span>
                </div>
              </div>
            </div>

            {/* Fourchette Haute */}
            <div
              className={`w-full py-2 px-3 rounded border text-sm transition ${
                estimation.rent_custom == null
                  ? "bg-blue-100 border-blue-400"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Fourchette Haute</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={estimation.rent_high ?? ""}
                    onChange={(e) => onChange({ rent_high: e.target.value ? Number(e.target.value) : null })}
                    className="w-24 text-right text-sm bg-transparent outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    placeholder="€/m²/an"
                  />
                  <span className="text-gray-500">€</span>
                </div>
              </div>
            </div>

            {/* Valeur personnalisée */}
            <div
              className={`w-full py-2 px-3 rounded border text-sm transition ${
                estimation.rent_custom != null
                  ? "bg-blue-100 border-blue-400"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Valeur personnalisée</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={estimation.rent_custom ?? ""}
                    onChange={(e) => onChange({ rent_custom: e.target.value ? Number(e.target.value) : null })}
                    className="w-24 text-right text-sm bg-transparent outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    placeholder="€/m²/an"
                  />
                  <span className="text-gray-500">€</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Taux de Capitalisation */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <label className="text-sm text-gray-600 block mb-2">
            Taux de Capitalisation (%)
          </label>
          <input
            type="number"
            value={estimation.rent_capitalization_rate}
            onChange={(e) => onChange({ rent_capitalization_rate: parseFloat(e.target.value) || 0 })}
            step="0.1"
            min="0"
            max="20"
            className="w-full text-2xl font-bold text-blue-900 bg-white border border-blue-300 rounded px-3 py-2 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <p className="text-xs text-gray-500 mt-2">Rendement voulu</p>
        </div>

        {/* Prix de Vente Estimé */}
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <p className="text-sm text-gray-600 mb-2">Prix de Vente de Marché Estimé</p>
          <p className="text-3xl font-bold mb-1" style={{ color: "#6c3483" }}>
            {formatNumber(pricePerM2)} €/m²
          </p>
          <p className="text-xs text-gray-500 mb-2">valeur totale</p>
          <p className="text-xl font-semibold" style={{ color: "#6c3483" }}>
            {formatNumber(totalPrice)} €
          </p>
          <p className="text-xs text-gray-500">prix au m²</p>
        </div>
      </div>
    </div>
  );
}
