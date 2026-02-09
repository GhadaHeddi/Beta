import { FileSearch, RefreshCw } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
  showResetButton?: boolean;
}

export function EmptyState({
  title = "Aucun resultat",
  description = "Aucun projet ne correspond a vos criteres de recherche.",
  onReset,
  showResetButton = true,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="bg-gray-100 rounded-full p-4 mb-4">
        <FileSearch className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 text-center max-w-sm mb-4">
        {description}
      </p>
      {showResetButton && onReset && (
        <Button variant="outline" onClick={onReset} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Reinitialiser les filtres
        </Button>
      )}
    </div>
  );
}
