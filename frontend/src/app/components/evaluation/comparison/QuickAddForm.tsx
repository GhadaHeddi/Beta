import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { quickAddComparable } from '@/services/projectService';

interface Props {
  projectId: number;
  onAdded: () => void;
}

export function QuickAddForm({ projectId, onAdded }: Props) {
  const [address, setAddress] = useState('');
  const [surface, setSurface] = useState('');
  const [price, setPrice] = useState('');
  const [constructionYear, setConstructionYear] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address.trim() || !surface || !price) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }

    setSubmitting(true);
    try {
      await quickAddComparable({
        project_id: projectId,
        address: address.trim(),
        surface: parseFloat(surface),
        price: parseFloat(price),
        construction_year: constructionYear ? parseInt(constructionYear) : undefined,
      });

      toast.success('Bien ajoute avec succes');

      // Reset form
      setAddress('');
      setSurface('');
      setPrice('');
      setConstructionYear('');

      onAdded();
    } catch (error: any) {
      if (error.message?.includes('geocoder') || error.message?.includes('adresse')) {
        toast.error('Adresse non trouvee, veuillez verifier');
      } else {
        toast.error(error.message || "Erreur lors de l'ajout");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
        Ajout rapide
      </h4>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-sm text-gray-700 font-medium block mb-1">
            Adresse *
          </label>
          <Input
            type="text"
            placeholder="15 rue de la Republique, 26000 Valence"
            className="h-9 text-sm"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={submitting}
          />
        </div>

        <div>
          <label className="text-sm text-gray-700 font-medium block mb-1">
            Surface (m{'\u00B2'}) *
          </label>
          <Input
            type="number"
            placeholder="280"
            className="h-9 text-sm"
            value={surface}
            onChange={(e) => setSurface(e.target.value)}
            min="1"
            disabled={submitting}
          />
        </div>

        <div>
          <label className="text-sm text-gray-700 font-medium block mb-1">
            Prix (EUR) *
          </label>
          <Input
            type="number"
            placeholder="1 100 000"
            className="h-9 text-sm"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="1"
            disabled={submitting}
          />
        </div>

        <div>
          <label className="text-sm text-gray-700 font-medium block mb-1">
            Annee de construction
          </label>
          <Input
            type="number"
            placeholder="2005"
            className="h-9 text-sm"
            value={constructionYear}
            onChange={(e) => setConstructionYear(e.target.value)}
            min="1800"
            max="2030"
            disabled={submitting}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={submitting || !address.trim() || !surface || !price}
        >
          <Plus className="w-4 h-4 mr-1" />
          {submitting ? 'Ajout en cours...' : 'Ajouter'}
        </Button>
      </form>
    </div>
  );
}
