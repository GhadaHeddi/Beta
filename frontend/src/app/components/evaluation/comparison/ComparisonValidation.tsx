import { CheckCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface Props {
  selectedCount: number;
  onValidate: () => void;
  loading?: boolean;
}

export function ComparisonValidation({ selectedCount, onValidate, loading }: Props) {
  return (
    <div className="flex justify-end">
      <Button
        size="lg"
        disabled={selectedCount === 0 || loading}
        onClick={onValidate}
        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
      >
        {loading ? (
          <>
            <span className="animate-spin mr-2">...</span>
            Validation en cours...
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5 mr-2" />
            Valider les comparables selectionnes ({selectedCount}/3)
          </>
        )}
      </Button>
    </div>
  );
}
