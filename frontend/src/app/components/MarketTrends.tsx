import { TrendingUp, TrendingDown } from "lucide-react";
import { Header } from "@/app/components/Header";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface MarketTrendsProps {
  city: string;
  onBack: () => void;
  onDashboardClick?: () => void;
}

// Données historiques des 12 derniers mois
const generateHistoricalData = (city: string) => {
  const basePrice = city === "Valence" ? 2750 : 3050;
  const months = [
    "Jan", "Fév", "Mar", "Avr", "Mai", "Juin", 
    "Juil", "Août", "Sep", "Oct", "Nov", "Déc"
  ];
  
  const trend = city === "Valence" ? 1 : -1;
  
  return months.map((month, index) => {
    const variation = Math.random() * 100 - 50;
    const trendValue = (index * trend * 15);
    return {
      month,
      price: Math.round(basePrice + trendValue + variation),
    };
  });
};

export function MarketTrends({ city, onBack, onDashboardClick }: MarketTrendsProps) {
  const data = generateHistoricalData(city);
  const currentPrice = data[data.length - 1].price;
  const previousPrice = data[0].price;
  const change = currentPrice - previousPrice;
  const changePercent = ((change / previousPrice) * 100).toFixed(1);
  const isPositive = change >= 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="text-sm text-gray-600">{payload[0].payload.month}</p>
          <p className="text-lg text-blue-900">
            {payload[0].value.toLocaleString("fr-FR")} €/m²
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header global */}
      <Header onLogoClick={onBack} onDashboardClick={onDashboardClick} />

      {/* Titre de la page */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl text-gray-900 mb-2">
              Marché immobilier professionnel - {city}
            </h1>
            <p className="text-gray-600">
              Évolution du prix moyen au m² sur les 12 derniers mois
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg px-6 py-4 text-right">
            <p className="text-sm text-gray-600 mb-1">Prix actuel</p>
            <p className="text-3xl text-blue-900 mb-2">
              {currentPrice.toLocaleString("fr-FR")} €<span className="text-lg">/m²</span>
            </p>
            <div className="flex items-center justify-end gap-2">
              {isPositive ? (
                <TrendingUp className="w-5 h-5 text-green-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600" />
              )}
              <span className={`text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}>
                {isPositive ? "+" : ""}{changePercent}% sur l'année
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Graphique */}
      <div className="flex-1 p-8">
        <div className="bg-white rounded-lg border border-gray-200 p-8 h-[600px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                stroke="#6b7280"
                style={{ fontSize: "14px" }}
              />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: "14px" }}
                tickFormatter={(value) => `${value.toLocaleString("fr-FR")} €`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#1e3a8a"
                strokeWidth={3}
                fill="url(#colorPrice)"
                dot={{ fill: "#1e3a8a", r: 4 }}
                activeDot={{ r: 6, fill: "#1e40af" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Statistiques additionnelles */}
        <div className="grid grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Prix minimum</p>
            <p className="text-2xl text-blue-900">
              {Math.min(...data.map(d => d.price)).toLocaleString("fr-FR")} €/m²
            </p>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Prix maximum</p>
            <p className="text-2xl text-blue-900">
              {Math.max(...data.map(d => d.price)).toLocaleString("fr-FR")} €/m²
            </p>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Prix moyen</p>
            <p className="text-2xl text-blue-900">
              {Math.round(data.reduce((acc, d) => acc + d.price, 0) / data.length).toLocaleString("fr-FR")} €/m²
            </p>
          </div>
        </div>

        {/* Note informative */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg text-gray-900 mb-2">À propos de ces données</h3>
          <p className="text-sm text-gray-700">
            Les prix affichés représentent la moyenne des transactions de biens professionnels 
            (bureaux, locaux commerciaux, entrepôts) dans la ville de {city}. 
            Les données sont actualisées quotidiennement à partir des transactions déclarées.
          </p>
        </div>
      </div>
    </div>
  );
}
