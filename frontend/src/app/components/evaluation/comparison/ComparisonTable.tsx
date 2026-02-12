import { useState, useRef, useEffect } from 'react';
import { X, Plus, Pencil } from 'lucide-react';
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
  onUpdate?: (id: number, fields: { surface?: number; price?: number; price_per_m2?: number; construction_year?: number }) => void;
}

const cellClass = 'text-sm break-words whitespace-normal align-top p-3';

interface EditingCell {
  id: number;
  field: 'surface' | 'price' | 'price_per_m2' | 'construction_year';
}

function EditableCell({
  value,
  suffix,
  compId,
  field,
  editingCell,
  onStartEdit,
  onSave,
  onCancel,
}: {
  value: number | null | undefined;
  suffix?: string;
  compId: number;
  field: EditingCell['field'];
  editingCell: EditingCell | null;
  onStartEdit: (cell: EditingCell) => void;
  onSave: (value: number) => void;
  onCancel: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isEditing = editingCell?.id === compId && editingCell?.field === field;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="number"
        defaultValue={value ?? ''}
        className="w-full border border-blue-400 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const val = parseFloat((e.target as HTMLInputElement).value);
            if (!isNaN(val) && val > 0) onSave(val);
          }
          if (e.key === 'Escape') onCancel();
        }}
        onBlur={(e) => {
          const val = parseFloat(e.target.value);
          if (!isNaN(val) && val > 0) onSave(val);
          else onCancel();
        }}
      />
    );
  }

  const displayValue = (field === 'price' || field === 'price_per_m2')
    ? (value != null ? value.toLocaleString('fr-FR') + ' EUR' : '-')
    : (value != null ? `${value}${suffix || ''}` : '-');

  return (
    <div
      className="group cursor-pointer flex items-center gap-1 hover:bg-blue-50 rounded px-1 -mx-1 transition-colors"
      onClick={() => onStartEdit({ id: compId, field })}
    >
      <span>{displayValue}</span>
      <Pencil className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </div>
  );
}

export function ComparisonTable({
  evaluatedProperty,
  selectedComparables,
  onRemove,
  onSelect,
  onSelectAll,
  finalSelection,
  onUpdate,
}: Props) {
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);

  if (selectedComparables.length === 0) {
    return (
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center mb-6">
        <p className="text-gray-500 text-lg">
          Cliquez sur un bien sur la carte pour le comparer avec votre bien
        </p>
      </div>
    );
  }

  const handleSave = (compId: number, field: EditingCell['field'], value: number) => {
    setEditingCell(null);
    if (onUpdate) {
      onUpdate(compId, { [field]: value });
    }
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
                  <EditableCell
                    value={comp.surface}
                    suffix={' m\u00B2'}
                    compId={comp.id}
                    field="surface"
                    editingCell={editingCell}
                    onStartEdit={setEditingCell}
                    onSave={(val) => handleSave(comp.id, 'surface', val)}
                    onCancel={() => setEditingCell(null)}
                  />
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
                  <EditableCell
                    value={comp.price}
                    compId={comp.id}
                    field="price"
                    editingCell={editingCell}
                    onStartEdit={setEditingCell}
                    onSave={(val) => handleSave(comp.id, 'price', val)}
                    onCancel={() => setEditingCell(null)}
                  />
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
                  <EditableCell
                    value={comp.price_per_m2}
                    compId={comp.id}
                    field="price_per_m2"
                    editingCell={editingCell}
                    onStartEdit={setEditingCell}
                    onSave={(val) => handleSave(comp.id, 'price_per_m2', val)}
                    onCancel={() => setEditingCell(null)}
                  />
                </TableCell>
              ))}
            </TableRow>

            {/* Annee de construction */}
            <TableRow>
              <TableCell className={`${cellClass} font-medium text-gray-700`}>Annee construction</TableCell>
              <TableCell className={`${cellClass} bg-blue-50/50`}>
                {evaluatedProperty.construction_year || '-'}
              </TableCell>
              {selectedComparables.map((comp) => (
                <TableCell key={comp.id} className={cellClass}>
                  <EditableCell
                    value={comp.construction_year}
                    compId={comp.id}
                    field="construction_year"
                    editingCell={editingCell}
                    onStartEdit={setEditingCell}
                    onSave={(val) => handleSave(comp.id, 'construction_year', val)}
                    onCancel={() => setEditingCell(null)}
                  />
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
                      comp.source === 'arthur_loyd' ? 'bg-red-500' : 'bg-violet-700'
                    }`}
                  >
                    {comp.source === 'arthur_loyd' ? 'Arthur Loyd' : 'Concurrence'}
                  </span>
                </TableCell>
              ))}
            </TableRow>

            {/* Statut */}
            <TableRow>
              <TableCell className={`${cellClass} font-medium text-gray-700`}>Statut</TableCell>
              <TableCell className={`${cellClass} bg-blue-50/50`}>-</TableCell>
              {selectedComparables.map((comp) => {
                const status = (comp as any).status;
                const isDisponible = status === 'disponible';
                return (
                  <TableCell key={comp.id} className={cellClass}>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs text-white ${
                        isDisponible ? 'bg-green-500' : 'bg-gray-800'
                      }`}
                    >
                      {isDisponible ? 'Disponible' : 'Transaction'}
                    </span>
                  </TableCell>
                );
              })}
            </TableRow>

            {/* Distance */}
            <TableRow>
              <TableCell className={`${cellClass} font-medium text-gray-700`}>Distance</TableCell>
              <TableCell className={`${cellClass} bg-blue-50/50`}>-</TableCell>
              {selectedComparables.map((comp) => (
                <TableCell key={comp.id} className={cellClass}>
                  {comp.distance != null ? `${comp.distance} km` : '-'}
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
