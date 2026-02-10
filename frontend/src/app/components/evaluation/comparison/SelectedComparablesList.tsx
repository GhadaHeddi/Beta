import { X, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import type { SelectedComparable } from '@/types/comparable';

interface Props {
  items: SelectedComparable[];
  onRemove: (id: number) => void;
  onRecompare: () => void;
  onValidate: () => void;
  loading?: boolean;
}

export function SelectedComparablesList({
  items,
  onRemove,
  onRecompare,
  onValidate,
  loading,
}: Props) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 mb-6 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-green-50 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Biens selectionnes pour la suite ({items.length})
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRecompare}
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Recomparer
          </Button>
          <Button
            size="sm"
            disabled={loading}
            onClick={onValidate}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              'Validation en cours...'
            ) : (
              <>
                Valider et passer a l'etape suivante
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((comp) => (
          <div
            key={comp.id}
            className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 break-words">
                {comp.address}
              </p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-gray-600">
                <span>{comp.surface} m{'\u00B2'}</span>
                <span className="font-semibold text-blue-900">
                  {comp.price_per_m2.toLocaleString('fr-FR')} EUR/m{'\u00B2'}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-white ${
                    comp.source === 'arthur_loyd' ? 'bg-blue-500' : 'bg-orange-500'
                  }`}
                >
                  {comp.source === 'arthur_loyd' ? 'Arthur Loyd' : 'Concurrence'}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 hover:bg-red-100"
              onClick={() => onRemove(comp.id)}
            >
              <X className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
