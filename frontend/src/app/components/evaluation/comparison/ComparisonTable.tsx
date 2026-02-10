import { X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import type { SelectedComparable, EvaluatedProperty } from '@/types/comparable';

interface Props {
  evaluatedProperty: EvaluatedProperty;
  selectedComparables: SelectedComparable[];
  onAdjustmentChange: (id: number, adjustment: number) => void;
  onRemove: (id: number) => void;
}

export function ComparisonTable({
  evaluatedProperty,
  selectedComparables,
  onAdjustmentChange,
  onRemove,
}: Props) {
  if (selectedComparables.length === 0) {
    return (
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center mb-6">
        <p className="text-gray-500 text-lg">
          Cliquez sur un bien sur la carte pour le comparer avec votre bien
        </p>
        <p className="text-gray-400 text-sm mt-2">
          Maximum 3 biens comparables
        </p>
      </div>
    );
  }

  const calculateAdjustedPrice = (pricePerM2: number, adjustment: number): number => {
    return Math.round(pricePerM2 * (1 + adjustment / 100));
  };

  const formatPrice = (price: number | null | undefined): string => {
    if (price === null || price === undefined) return '-';
    return price.toLocaleString('fr-FR') + ' EUR';
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 mb-6 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-medium text-gray-900">
          Comparaison ({selectedComparables.length}/3 biens selectionnes)
        </h3>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[180px] font-medium">Critere</TableHead>
              <TableHead className="bg-blue-50 font-medium">Bien evalue</TableHead>
              {selectedComparables.map((comp, index) => (
                <TableHead key={comp.id} className="relative">
                  <div className="flex items-center justify-between">
                    <span>Comparable {index + 1}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-red-100"
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
            {/* Photo placeholder */}
            <TableRow>
              <TableCell className="font-medium text-gray-700">Photo</TableCell>
              <TableCell className="bg-blue-50/50">
                <div className="w-24 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                  Pas de photo
                </div>
              </TableCell>
              {selectedComparables.map((comp) => (
                <TableCell key={comp.id}>
                  <div className="w-24 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                    Pas de photo
                  </div>
                </TableCell>
              ))}
            </TableRow>

            {/* Adresse */}
            <TableRow>
              <TableCell className="font-medium text-gray-700">Adresse</TableCell>
              <TableCell className="bg-blue-50/50 text-sm">
                {evaluatedProperty.address}
              </TableCell>
              {selectedComparables.map((comp) => (
                <TableCell key={comp.id} className="text-sm">
                  {comp.address}
                </TableCell>
              ))}
            </TableRow>

            {/* Type de bien */}
            <TableRow>
              <TableCell className="font-medium text-gray-700">Type de bien</TableCell>
              <TableCell className="bg-blue-50/50 text-sm capitalize">
                {evaluatedProperty.property_type}
              </TableCell>
              {selectedComparables.map((comp) => (
                <TableCell key={comp.id} className="text-sm capitalize">
                  {evaluatedProperty.property_type}
                </TableCell>
              ))}
            </TableRow>

            {/* Surface */}
            <TableRow>
              <TableCell className="font-medium text-gray-700">Surface (m2)</TableCell>
              <TableCell className="bg-blue-50/50 text-sm">
                {evaluatedProperty.surface ? `${evaluatedProperty.surface} m2` : '-'}
              </TableCell>
              {selectedComparables.map((comp) => (
                <TableCell key={comp.id} className="text-sm">
                  {comp.surface} m2
                </TableCell>
              ))}
            </TableRow>

            {/* Annee de construction */}
            <TableRow>
              <TableCell className="font-medium text-gray-700">Annee construction</TableCell>
              <TableCell className="bg-blue-50/50 text-sm">
                {evaluatedProperty.construction_year || '-'}
              </TableCell>
              {selectedComparables.map((comp) => (
                <TableCell key={comp.id} className="text-sm">
                  -
                </TableCell>
              ))}
            </TableRow>

            {/* Prix de vente */}
            <TableRow>
              <TableCell className="font-medium text-gray-700">Prix de vente</TableCell>
              <TableCell className="bg-blue-50/50 text-sm font-medium">
                A estimer
              </TableCell>
              {selectedComparables.map((comp) => (
                <TableCell key={comp.id} className="text-sm">
                  {formatPrice(comp.price)}
                </TableCell>
              ))}
            </TableRow>

            {/* Prix au m2 */}
            <TableRow>
              <TableCell className="font-medium text-gray-700">Prix/m2</TableCell>
              <TableCell className="bg-blue-50/50 text-sm font-semibold text-blue-900">
                A estimer
              </TableCell>
              {selectedComparables.map((comp) => (
                <TableCell key={comp.id} className="text-sm font-semibold text-blue-900">
                  {comp.price_per_m2.toLocaleString('fr-FR')} EUR
                </TableCell>
              ))}
            </TableRow>

            {/* Date de transaction */}
            <TableRow>
              <TableCell className="font-medium text-gray-700">Date transaction</TableCell>
              <TableCell className="bg-blue-50/50 text-sm">-</TableCell>
              {selectedComparables.map((comp) => (
                <TableCell key={comp.id} className="text-sm">
                  {formatDate(comp.transaction_date)}
                </TableCell>
              ))}
            </TableRow>

            {/* Source */}
            <TableRow>
              <TableCell className="font-medium text-gray-700">Source</TableCell>
              <TableCell className="bg-blue-50/50 text-sm">-</TableCell>
              {selectedComparables.map((comp) => (
                <TableCell key={comp.id} className="text-sm">
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

            {/* Ajustement */}
            <TableRow>
              <TableCell className="font-medium text-gray-700">Ajustement (%)</TableCell>
              <TableCell className="bg-blue-50/50 text-sm">-</TableCell>
              {selectedComparables.map((comp) => (
                <TableCell key={comp.id}>
                  <Input
                    type="number"
                    min={-50}
                    max={50}
                    step={1}
                    value={comp.adjustment}
                    onChange={(e) =>
                      onAdjustmentChange(comp.id, parseFloat(e.target.value) || 0)
                    }
                    className="w-20 h-8 text-center"
                  />
                </TableCell>
              ))}
            </TableRow>

            {/* Prix ajuste */}
            <TableRow className="bg-green-50">
              <TableCell className="font-medium text-gray-700">Prix ajuste/m2</TableCell>
              <TableCell className="bg-blue-50/50 text-sm">-</TableCell>
              {selectedComparables.map((comp) => (
                <TableCell key={comp.id} className="text-sm font-bold text-green-700">
                  {calculateAdjustedPrice(comp.price_per_m2, comp.adjustment).toLocaleString(
                    'fr-FR'
                  )}{' '}
                  EUR
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
