import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface CityMarketData {
  city: string;
  pricePerSqm: number;
  trend: "up" | "down" | "stable";
  changePercent: number;
}

const marketData: CityMarketData[] = [
  {
    city: "Valence",
    pricePerSqm: 2850,
    trend: "up",
    changePercent: 2.3,
  },
  {
    city: "Avignon",
    pricePerSqm: 3120,
    trend: "down",
    changePercent: -1.5,
  },
];

export function MarketIndicators({ onCityClick }: { onCityClick: (city: string) => void }) {
  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case "down":
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      case "stable":
        return <Minus className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      case "stable":
        return "text-gray-600";
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-5">
      <h4 className="text-sm text-gray-700 mb-4">Marché immobilier professionnel</h4>
      <div className="space-y-3">
        {marketData.map((data) => (
          <button
            key={data.city}
            onClick={() => onCityClick(data.city)}
            className="w-full bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-lg p-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-700">{data.city}</span>
              <div className="flex items-center gap-1">
                {getTrendIcon(data.trend)}
                <span className={`text-xs ${getTrendColor(data.trend)}`}>
                  {data.changePercent > 0 ? "+" : ""}{data.changePercent}%
                </span>
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl text-blue-900">{data.pricePerSqm.toLocaleString("fr-FR")} €</span>
                <span className="text-sm text-gray-600 ml-1">/m²</span>
              </div>
              <span className="text-xs text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity">
                Voir l'historique →
              </span>
            </div>
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-3 text-center">
        Données en temps réel • Mis à jour il y a 5 min
      </p>
    </div>
  );
}
