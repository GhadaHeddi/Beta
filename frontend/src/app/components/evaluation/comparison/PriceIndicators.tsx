import { TrendingUp, Home, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import type { PriceStats } from '@/types/comparable';

interface Props {
  stats: PriceStats | null;
  loading?: boolean;
}

export function PriceIndicators({ stats, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatPrice = (price: number | null | undefined): string => {
    if (price === null || price === undefined) return 'N/A';
    return price.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' EUR/m2';
  };

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {/* Loyer moyen */}
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Home className="w-5 h-5 opacity-90" />
            <span className="text-sm opacity-90">Prix moyen location/m2</span>
          </div>
          <p className="text-2xl font-bold">
            {formatPrice(stats?.avg_rent_per_m2)}
          </p>
          <p className="text-xs opacity-75 mt-1">
            Base sur {stats?.rent_count || 0} bien{(stats?.rent_count || 0) > 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      {/* Vente moyenne */}
      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 opacity-90" />
            <span className="text-sm opacity-90">Prix moyen vente/m2</span>
          </div>
          <p className="text-2xl font-bold">
            {formatPrice(stats?.avg_sale_per_m2)}
          </p>
          <p className="text-xs opacity-75 mt-1">
            Base sur {stats?.sale_count || 0} vente{(stats?.sale_count || 0) > 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      {/* Derniere vente */}
      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 opacity-90" />
            <span className="text-sm opacity-90">Dernier prix vente/m2</span>
          </div>
          <p className="text-2xl font-bold">
            {formatPrice(stats?.latest_sale_per_m2)}
          </p>
          <p className="text-xs opacity-75 mt-1">
            {stats?.latest_sale_date
              ? `Transaction du ${new Date(stats.latest_sale_date).toLocaleDateString('fr-FR')}`
              : 'Aucune transaction recente'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
