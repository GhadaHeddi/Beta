import type { MarketEstimation } from "@/types/analysis";

function formatNumber(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return "0";
  return Math.round(value).toLocaleString("fr-FR");
}

interface RentalEstimationProps {
  estimation: MarketEstimation;
  onChange: (updates: Partial<MarketEstimation>) => void;
}

export function RentalEstimation({ estimation, onChange }: RentalEstimationProps) {
  const salePrice = estimation.sale_price_custom ?? estimation.sale_price_high ?? 0;
  const rate = estimation.sale_capitalization_rate || 8;
  const estimatedRent = salePrice * (rate / 100);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg text-gray-900 mb-4 font-medium">
        Estimation du Loyer de Marché (depuis Prix de Vente)
      </h3>

      <div className="grid grid-cols-3 gap-6">
        {/* Prix de Vente Constaté */}
        <div>
          <p className="text-sm text-gray-600 mb-2">Prix de Vente Constaté</p>
          <div className="space-y-2">
            {/* Fourchette Basse */}
            <div className="w-full py-2 px-3 rounded border bg-gray-50 border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Fourchette Basse</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={estimation.sale_price_low ?? ""}
                    onChange={(e) => onChange({ sale_price_low: e.target.value ? Number(e.target.value) : null })}
                    className="w-24 text-right text-sm bg-transparent outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    placeholder="€/m²"
                  />
                  <span className="text-sm text-gray-500">€</span>
                </div>
              </div>
            </div>

            {/* Fourchette Haute */}
            <div
              className={`w-full py-2 px-3 rounded border text-sm transition ${
                estimation.sale_price_custom == null
                  ? "bg-blue-100 border-blue-400"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Fourchette Haute</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={estimation.sale_price_high ?? ""}
                    onChange={(e) => onChange({ sale_price_high: e.target.value ? Number(e.target.value) : null })}
                    className="w-24 text-right text-sm bg-transparent outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    placeholder="€/m²"
                  />
                  <span className="text-gray-500">€</span>
                </div>
              </div>
            </div>

            {/* Valeur personnalisée */}
            <div
              className={`w-full py-2 px-3 rounded border text-sm transition ${
                estimation.sale_price_custom != null
                  ? "bg-blue-100 border-blue-400"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Valeur personnalisée</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={estimation.sale_price_custom ?? ""}
                    onChange={(e) => onChange({ sale_price_custom: e.target.value ? Number(e.target.value) : null })}
                    className="w-24 text-right text-sm bg-transparent outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    placeholder="€/m²"
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
            value={estimation.sale_capitalization_rate}
            onChange={(e) => onChange({ sale_capitalization_rate: parseFloat(e.target.value) || 0 })}
            step="0.1"
            min="0"
            max="20"
            className="w-full text-2xl font-bold text-blue-900 bg-white border border-blue-300 rounded px-3 py-2 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <p className="text-xs text-gray-500 mt-2">Rendement voulu</p>
        </div>

        {/* Loyer Estimé */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-gray-600 mb-2">Loyer de Marché Estimé</p>
          <p className="text-3xl font-bold mb-1" style={{ color: "#27ae60" }}>
            {formatNumber(estimatedRent)} €
          </p>
          <p className="text-xs text-gray-500">par m² / an</p>
        </div>
      </div>
    </div>
  );
}
