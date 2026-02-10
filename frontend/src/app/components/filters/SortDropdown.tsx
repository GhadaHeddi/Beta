import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import type { ProjectSort, SortField, SortOrder } from '@/types/project';

interface SortDropdownProps {
  sort: ProjectSort;
  onSortChange: (sort: ProjectSort) => void;
}

const sortOptions: { value: SortField; label: string }[] = [
  { value: 'updated_at', label: 'Date de modification' },
  { value: 'created_at', label: 'Date de creation' },
  { value: 'title', label: 'Titre' },
  { value: 'construction_year', label: 'Annee de construction' },
];

export function SortDropdown({ sort, onSortChange }: SortDropdownProps) {
  const currentLabel = sortOptions.find(o => o.value === sort.sortBy)?.label ?? 'Trier';

  const handleSortByChange = (sortBy: SortField) => {
    onSortChange({ ...sort, sortBy });
  };

  const toggleSortOrder = () => {
    const newOrder: SortOrder = sort.sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange({ ...sort, sortOrder: newOrder });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          {sort.sortOrder === 'asc' ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )}
          {currentLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {sortOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleSortByChange(option.value)}
            className={sort.sortBy === option.value ? 'bg-accent' : ''}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={toggleSortOrder}>
          {sort.sortOrder === 'asc' ? (
            <>
              <ArrowDown className="h-4 w-4 mr-2" />
              Decroissant
            </>
          ) : (
            <>
              <ArrowUp className="h-4 w-4 mr-2" />
              Croissant
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
