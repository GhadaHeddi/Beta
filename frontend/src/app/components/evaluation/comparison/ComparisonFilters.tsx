import { RotateCcw } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Slider } from '@/app/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import type { ComparisonFilters as FiltersType } from '@/types/comparable';

interface Props {
  filters: FiltersType;
  onFiltersChange: (filters: FiltersType) => void;
  onReset: () => void;
}

export function ComparisonFilters({ filters, onFiltersChange, onReset }: Props) {
  const handleSurfaceMinChange = (value: string) => {
    onFiltersChange({
      ...filters,
      surfaceMin: value ? parseInt(value) : null
    });
  };

  const handleSurfaceMaxChange = (value: string) => {
    onFiltersChange({
      ...filters,
      surfaceMax: value ? parseInt(value) : null
    });
  };

  const handleYearMinChange = (value: string) => {
    onFiltersChange({
      ...filters,
      yearMin: value ? parseInt(value) : null
    });
  };

  const handleYearMaxChange = (value: string) => {
    onFiltersChange({
      ...filters,
      yearMax: value ? parseInt(value) : null
    });
  };

  const handleDistanceChange = (values: number[]) => {
    onFiltersChange({
      ...filters,
      distanceKm: values[0]
    });
  };

  const handleSourceChange = (value: string) => {
    onFiltersChange({
      ...filters,
      source: value as FiltersType['source']
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Filtres</h4>

      {/* Surface */}
      <div>
        <label className="text-sm text-gray-700 font-medium block mb-1">
          Surface (m2)
        </label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            className="h-9"
            value={filters.surfaceMin ?? ''}
            onChange={(e) => handleSurfaceMinChange(e.target.value)}
          />
          <span className="text-gray-400">-</span>
          <Input
            type="number"
            placeholder="Max"
            className="h-9"
            value={filters.surfaceMax ?? ''}
            onChange={(e) => handleSurfaceMaxChange(e.target.value)}
          />
        </div>
      </div>

      {/* Annee de construction */}
      <div>
        <label className="text-sm text-gray-700 font-medium block mb-1">
          Annee de construction
        </label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            className="h-9"
            value={filters.yearMin ?? ''}
            onChange={(e) => handleYearMinChange(e.target.value)}
          />
          <span className="text-gray-400">-</span>
          <Input
            type="number"
            placeholder="Max"
            className="h-9"
            value={filters.yearMax ?? ''}
            onChange={(e) => handleYearMaxChange(e.target.value)}
          />
        </div>
      </div>

      {/* Distance */}
      <div>
        <label className="text-sm text-gray-700 font-medium block mb-1">
          Distance: {filters.distanceKm} km
        </label>
        <Slider
          value={[filters.distanceKm]}
          min={0.5}
          max={20}
          step={0.5}
          onValueChange={handleDistanceChange}
          className="w-full"
        />
      </div>

      {/* Source */}
      <div>
        <label className="text-sm text-gray-700 font-medium block mb-1">
          Source
        </label>
        <Select value={filters.source} onValueChange={handleSourceChange}>
          <SelectTrigger className="w-full h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="arthur_loyd">Arthur Loyd</SelectItem>
            <SelectItem value="concurrence">Concurrence</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reset */}
      <Button
        variant="outline"
        size="sm"
        onClick={onReset}
        className="w-full"
      >
        <RotateCcw className="w-4 h-4 mr-1" />
        Reinitialiser
      </Button>
    </div>
  );
}
