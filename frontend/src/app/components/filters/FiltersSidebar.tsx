import { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, X, Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Label } from '@/app/components/ui/label';
import { Slider } from '@/app/components/ui/slider';
import { Badge } from '@/app/components/ui/badge';
import { Separator } from '@/app/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/app/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/components/ui/popover';
import type { ProjectFilters, FiltersMetadata, PropertyType } from '@/types/project';

const propertyTypeLabels: Record<PropertyType, string> = {
  office: 'Bureaux',
  warehouse: 'Entrepot',
  retail: 'Commerce',
  industrial: "Locaux d'activite",
  land: 'Terrain',
  mixed: 'Mixte',
};

const propertyTypeColors: Record<PropertyType, string> = {
  office: 'bg-blue-100 text-blue-800',
  warehouse: 'bg-orange-100 text-orange-800',
  retail: 'bg-green-100 text-green-800',
  industrial: 'bg-purple-100 text-purple-800',
  land: 'bg-yellow-100 text-yellow-800',
  mixed: 'bg-gray-100 text-gray-800',
};

interface FiltersSidebarProps {
  filters: ProjectFilters;
  metadata: FiltersMetadata | null;
  activeFiltersCount: number;
  onTogglePropertyType: (type: PropertyType) => void;
  onCityChange: (city: string) => void;
  onConsultantChange: (id: number | null) => void;
  onYearRangeChange: (min: number | null, max: number | null) => void;
  onReset: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function FiltersSidebar({
  filters,
  metadata,
  activeFiltersCount,
  onTogglePropertyType,
  onCityChange,
  onConsultantChange,
  onYearRangeChange,
  onReset,
  isCollapsed,
  onToggleCollapse,
}: FiltersSidebarProps) {
  const [cityOpen, setCityOpen] = useState(false);

  // Valeurs par defaut pour le slider d'annees
  const defaultMinYear = 1900;
  const defaultMaxYear = new Date().getFullYear();
  const minYear = metadata?.construction_year_range[0] ?? defaultMinYear;
  const maxYear = metadata?.construction_year_range[1] ?? defaultMaxYear;

  // Valeurs actuelles du slider
  const currentMinYear = filters.constructionYearMin ?? minYear;
  const currentMaxYear = filters.constructionYearMax ?? maxYear;

  const handleYearChange = (values: number[]) => {
    const [min, max] = values;
    // Ne pas envoyer les valeurs si elles sont egales aux extremes
    const newMin = min === minYear ? null : min;
    const newMax = max === maxYear ? null : max;
    onYearRangeChange(newMin, newMax);
  };

  return (
    <div
      className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out sticky top-0 h-fit ${
        isCollapsed ? 'w-0 overflow-hidden border-r-0' : 'w-[280px]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">Filtres</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onReset}
              title="Reinitialiser les filtres"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onToggleCollapse}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Filtre Type de bien */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Type de bien</Label>
          <div className="space-y-2">
            {(Object.keys(propertyTypeLabels) as PropertyType[]).map((type) => {
              const count = metadata?.property_type_counts[type] ?? 0;
              return (
                <div key={type} className="flex items-center gap-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={filters.propertyTypes.includes(type)}
                    onCheckedChange={() => onTogglePropertyType(type)}
                  />
                  <Label
                    htmlFor={`type-${type}`}
                    className="text-sm text-gray-600 flex-1 cursor-pointer flex items-center gap-2"
                  >
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${propertyTypeColors[type]}`}
                    >
                      {propertyTypeLabels[type]}
                    </span>
                  </Label>
                  <span className="text-xs text-gray-400">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Filtre Ville (Autocomplete) */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Ville</Label>
          <Popover open={cityOpen} onOpenChange={setCityOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={cityOpen}
                className="w-full justify-between"
              >
                {filters.city || "Toutes les villes"}
                <div className="flex items-center gap-1">
                  {filters.city && (
                    <X
                      className="h-4 w-4 opacity-50 hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCityChange('');
                      }}
                    />
                  )}
                  <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[240px] p-0">
              <Command>
                <CommandInput placeholder="Rechercher une ville..." />
                <CommandList>
                  <CommandEmpty>Aucune ville trouvee</CommandEmpty>
                  <CommandGroup>
                    {metadata?.available_cities.map((city) => (
                      <CommandItem
                        key={city}
                        value={city}
                        onSelect={() => {
                          onCityChange(city);
                          setCityOpen(false);
                        }}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            filters.city === city ? 'opacity-100' : 'opacity-0'
                          }`}
                        />
                        {city}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <Separator />

        {/* Filtre Consultant */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Consultant</Label>
          <Select
            value={filters.consultantId?.toString() ?? 'all'}
            onValueChange={(value) =>
              onConsultantChange(value === 'all' ? null : parseInt(value))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Tous les consultants" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les consultants</SelectItem>
              {metadata?.available_consultants.map((consultant) => (
                <SelectItem key={consultant.id} value={consultant.id.toString()}>
                  {consultant.first_name} {consultant.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Filtre Annee de construction (Slider) */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">
            Annee de construction
          </Label>
          {minYear && maxYear && minYear !== maxYear ? (
            <>
              <div className="px-2 pt-2">
                <Slider
                  value={[currentMinYear, currentMaxYear]}
                  min={minYear}
                  max={maxYear}
                  step={1}
                  onValueChange={handleYearChange}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 px-2">
                <span>{currentMinYear}</span>
                <span>{currentMaxYear}</span>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400">Aucune donnee disponible</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Bouton pour ouvrir la sidebar quand elle est collapsed
export function FiltersSidebarToggle({
  onClick,
  activeFiltersCount,
}: {
  onClick: () => void;
  activeFiltersCount: number;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="gap-2"
    >
      <ChevronRight className="h-4 w-4" />
      Filtres
      {activeFiltersCount > 0 && (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          {activeFiltersCount}
        </Badge>
      )}
    </Button>
  );
}
