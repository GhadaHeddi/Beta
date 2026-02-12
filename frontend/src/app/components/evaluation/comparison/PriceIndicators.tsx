import { MapPin, Building, Target } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import type { PerimeterStats } from '@/types/comparable';

interface Props {
  perimeterStats: PerimeterStats[] | null;
  loading?: boolean;
}

const PERIMETER_CONFIG = [
  { icon: Building, gradient: 'from-blue-500 to-blue-600' },
  { icon: MapPin, gradient: 'from-indigo-500 to-indigo-600' },
  { icon: Target, gradient: 'from-violet-500 to-violet-600' },
];

export function PriceIndicators({ perimeterStats, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-24 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatPrice = (price: number | null | undefined): string => {
    if (price === null || price === undefined) return 'N/A';
    return price.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' EUR/m\u00B2';
  };

  // Si pas de stats, afficher les 3 bulles vides
  const stats = perimeterStats && perimeterStats.length === 3
    ? perimeterStats
    : [
        { label: 'Agglomeration', avg_rent_per_m2: null, avg_sale_per_m2: null, total_count: 0 },
        { label: 'Secteur', avg_rent_per_m2: null, avg_sale_per_m2: null, total_count: 0 },
        { label: 'Proximite', avg_rent_per_m2: null, avg_sale_per_m2: null, total_count: 0 },
      ];

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {stats.map((stat, index) => {
        const config = PERIMETER_CONFIG[index];
        const Icon = config.icon;
        const hasData = stat.total_count > 0;

        return (
          <Card key={index} className={`bg-gradient-to-r ${config.gradient} text-white border-0`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-5 h-5 opacity-90" />
                <span className="text-sm font-medium opacity-90">{stat.label}</span>
              </div>

              {hasData ? (
                <>
                  <div className="space-y-1">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs opacity-75">Location :</span>
                      <span className="text-lg font-bold">
                        {stat.avg_rent_per_m2 != null
                          ? formatPrice(stat.avg_rent_per_m2) + '/an'
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs opacity-75">Vente :</span>
                      <span className="text-lg font-bold">
                        {formatPrice(stat.avg_sale_per_m2)}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs opacity-75 mt-2">
                    Base sur {stat.total_count} bien{stat.total_count > 1 ? 's' : ''}
                  </p>
                </>
              ) : (
                <p className="text-sm opacity-75 mt-2">Donnees insuffisantes</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
