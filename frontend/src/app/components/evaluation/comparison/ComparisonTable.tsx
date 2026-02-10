import { X, Plus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { Button } from '@/app/components/ui/button';
import type { SelectedComparable, EvaluatedProperty } from '@/types/comparable';

interface Props {
  evaluatedProperty: EvaluatedProperty;
  selectedComparables: SelectedComparable[];
  onRemove: (id: number) => void;
  onSelect: (id: number) => void;
  onSelectAll: () => void;
  finalSelection: number[];
}

const cellClass = 'text-sm break-words whitespace-normal align-top p-3';

export function ComparisonTable({
  evaluatedProperty,
  selectedComparables,
  onRemove,
  onSelect,
  onSelectAll,
  finalSelection,
}: Props) {
  if (selectedComparables.length === 0) {
    return (
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center mb-6">
        <p className="text-gray-500 text-lg">
          Cliquez sur un bien sur la carte pour le comparer avec votre bien
        </p>
      </div>
    );
  }

  const formatPrice = (price: number | null | undefined): string => {
    if (price === null || price === undefined) return '-';
    return price.toLocaleString('fr-FR') + ' EUR';
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  const dataColWidth = `${Math.floor((100 - 15) / (selectedComparables.length + 1))}%`;

  return (
    <div className="bg-white rounded-lg border border-gray-200 mb-6 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Comparaison ({selectedComparables.length} biens)
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onSelectAll}
        >
          <Plus className="w-4 h-4 mr-1" />
          Selectionner tous les biens
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[15%] font-medium p-3">Critere</TableHead>
              <TableHead className="bg-blue-50 font-medium p-3" style={{ width: dataColWidth }}>Bien evalue</TableHead>
              {selectedComparables.map((comp, index) => (
                <TableHead key={comp.id} className="p-3" style={{ width: dataColWidth }}>
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate">Comparable {index + 1}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 hover:bg-red-100"
                      onClick={() => onRemove(comp.id)}
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Adresse */}
            <TableRow>
              <TableCell className={`${cellClass} font-medium text-gray-700`}>Adresse</TableCell>
              <TableCell className={`${cellClass} bg-blue-50/50`}>
                {evaluatedProperty.address}
              </TableCell>
              {selectedComparables.map((comp) => (
                <TableCell key={comp.id} className={cellClass}>
                  {comp.address}
                </TableCell>
              ))}
            </TableRow>

            {/* Surface */}
            <TableRow>
              <TableCell className={`${cellClass} font-medium text-gray-700`}>Surface</TableCell>
              <TableCell className={`${cellClass} bg-blue-50/50`}>
                {evaluatedProperty.surface ? `${evaluatedProperty.surface} m\u00B2` : '-'}
              </TableCell>
              {selectedComparables.map((comp) => (
                <TableCell key={comp.id} className={cellClass}>
                  {comp.surface} m{'\u00B2'}
                </TableCell>
              ))}
            </TableRow>

            {/* Prix de vente */}
            <TableRow>
              <TableCell className={`${cellClass} font-medium text-gray-700`}>Prix</TableCell>
              <TableCell className={`${cellClass} bg-blue-50/50 font-medium`}>
                A estimer
              </TableCell>
              {selectedComparables.map((comp) => (
                <TableCell key={comp.id} className={cellClass}>
                  {formatPrice(comp.price)}
                </TableCell>
              ))}
            </TableRow>

            {/* Prix au m2 */}
            <TableRow>
              <TableCell className={`${cellClass} font-medium text-gray-700`}>Prix/m{'\u00B2'}</TableCell>
              <TableCell className={`${cellClass} bg-blue-50/50 font-semibold text-blue-900`}>
                A estimer
              </TableCell>
              {selectedComparables.map((comp) => (
                <TableCell key={comp.id} className={`${cellClass} font-semibold text-blue-900`}>
                  {comp.price_per_m2.toLocaleString('fr-FR')} EUR
                </TableCell>
              ))}
            </TableRow>

            {/* Date de transaction */}
            <TableRow>
              <TableCell className={`${cellClass} font-medium text-gray-700`}>Date</TableCell>
              <TableCell className={`${cellClass} bg-blue-50/50`}>-</TableCell>
              {selectedComparables.map((comp) => (
                <TableCell key={comp.id} className={cellClass}>
                  {formatDate(comp.transaction_date)}
                </TableCell>
              ))}
            </TableRow>

            {/* Source */}
            <TableRow>
              <TableCell className={`${cellClass} font-medium text-gray-700`}>Source</TableCell>
              <TableCell className={`${cellClass} bg-blue-50/50`}>-</TableCell>
              {selectedComparables.map((comp) => (
                <TableCell key={comp.id} className={cellClass}>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs text-white ${
                      comp.source === 'arthur_loyd' ? 'bg-blue-500' : 'bg-orange-500'
                    }`}
                  >
                    {comp.source === 'arthur_loyd' ? 'Arthur Loyd' : 'Concurrence'}
                  </span>
                </TableCell>
              ))}
            </TableRow>

            {/* Distance */}
            <TableRow>
              <TableCell className={`${cellClass} font-medium text-gray-700`}>Distance</TableCell>
              <TableCell className={`${cellClass} bg-blue-50/50`}>-</TableCell>
              {selectedComparables.map((comp) => (
                <TableCell key={comp.id} className={cellClass}>
                  {comp.source_reference ? '-' : '-'}
                </TableCell>
              ))}
            </TableRow>

            {/* Bouton de selection */}
            <TableRow className="bg-gray-50">
              <TableCell className={`${cellClass} font-medium text-gray-700`}>Selection</TableCell>
              <TableCell className={`${cellClass} bg-blue-50/50`}>-</TableCell>
              {selectedComparables.map((comp) => {
                const isSelected = finalSelection.includes(comp.id);
                return (
                  <TableCell key={comp.id} className={cellClass}>
                    <Button
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      className={isSelected ? 'w-full':'bg-green-600 hover:bg-green-700 w-full' }
                      onClick={() => onSelect(comp.id)}
                    >
                      {isSelected ? 'Retirer' : 'Selectionner'}
                    </Button>
                  </TableCell>
                );
              })}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
