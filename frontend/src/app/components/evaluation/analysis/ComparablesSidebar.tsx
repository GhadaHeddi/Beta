import type { SelectedComparable } from "@/types/comparable";

function formatNumber(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return "0";
  return Math.round(value).toLocaleString("fr-FR");
}

interface ComparablesSidebarProps {
  comparables: SelectedComparable[];
  onGoToComparison?: () => void;
}

export function ComparablesSidebar({ comparables, onGoToComparison }: ComparablesSidebarProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base text-gray-900 font-medium">Biens Comparables</h3>
        {onGoToComparison && (
          <button
            onClick={onGoToComparison}
            className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
          >
            Modifier
          </button>
        )}
      </div>

      {comparables.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          Aucun comparable sélectionné.
        </p>
      ) : (
        <div className="space-y-3 overflow-y-auto flex-1 pr-1">
          {comparables.map((comp) => (
            <div
              key={comp.id}
              className="border border-gray-100 rounded-lg overflow-hidden flex h-24 bg-white shadow-sm"
            >
              {/* Texte */}
              <div className="w-1/2 p-3 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-gray-600 truncate">
                    {comp.source ?? "Comparable"} • {comp.surface}m²
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    {formatNumber(comp.price_per_m2)} €/m²
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatNumber(comp.price)} €
                  </p>
                </div>
              </div>

              {/* Image placeholder */}
              <div className="w-1/2 bg-gray-100 flex items-center justify-center">
                <span className="text-gray-300 text-xs">Photo</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
