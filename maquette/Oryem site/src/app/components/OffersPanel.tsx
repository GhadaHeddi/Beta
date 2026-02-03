import { MapPin, RefreshCw, ExternalLink } from "lucide-react";
import { MarketIndicators } from "@/app/components/MarketIndicators";

interface Offer {
  id: string;
  title: string;
  price: string;
  platform: "SeLoger" | "LeBonCoin" | "PAP";
  surface: string;
  type: string;
  postedAt: string;
  isNew: boolean;
  url: string;
}

const mockOffers: Offer[] = [
  {
    id: "1",
    title: "Bureaux modernes avec parking Centre d'affaires",
    price: "1 250 000 €",
    platform: "SeLoger",
    surface: "280 m²",
    type: "Bureaux",
    postedAt: "Il y a 2h",
    isNew: true,
    url: "https://www.seloger-bureaux-commerces.com/annonces/location/boutique/valence-26000/253340687?m=search_to_detail",
  },
  {
    id: "2",
    title: "Local commercial emplacement premium zone piétonne",
    price: "850 000 €",
    platform: "LeBonCoin",
    surface: "150 m²",
    type: "Local commercial",
    postedAt: "Il y a 5h",
    isNew: true,
    url: "https://www.seloger-bureaux-commerces.com/annonces/location/boutique/valence-26000/253340687?m=search_to_detail",
  },
  {
    id: "3",
    title: "Entrepôt logistique avec quai de chargement",
    price: "2 100 000 €",
    platform: "PAP",
    surface: "1200 m²",
    type: "Entrepôt",
    postedAt: "Il y a 8h",
    isNew: true,
    url: "https://www.seloger-bureaux-commerces.com/annonces/location/boutique/valence-26000/253340687?m=search_to_detail",
  },
  {
    id: "4",
    title: "Immeuble de bureaux standing quartier d'affaires",
    price: "4 500 000 €",
    platform: "SeLoger",
    surface: "850 m²",
    type: "Immeuble",
    postedAt: "Il y a 1j",
    isNew: false,
    url: "https://www.seloger-bureaux-commerces.com/annonces/location/boutique/valence-26000/253340687?m=search_to_detail",
  },
  {
    id: "5",
    title: "Locaux d'activité avec bureaux et atelier",
    price: "1 650 000 €",
    platform: "LeBonCoin",
    surface: "420 m²",
    type: "Locaux d'activité",
    postedAt: "Il y a 1j",
    isNew: false,
    url: "https://www.seloger-bureaux-commerces.com/annonces/location/boutique/valence-26000/253340687?m=search_to_detail",
  },
  {
    id: "6",
    title: "Commerce pied d'immeuble forte visibilité",
    price: "680 000 €",
    platform: "PAP",
    surface: "95 m²",
    type: "Commerce",
    postedAt: "Il y a 2j",
    isNew: false,
    url: "https://www.seloger-bureaux-commerces.com/annonces/location/boutique/valence-26000/253340687?m=search_to_detail",
  },
];

const platformStyles = {
  SeLoger: "bg-blue-100 text-blue-700 border-blue-200",
  LeBonCoin: "bg-orange-100 text-orange-700 border-orange-200",
  PAP: "bg-purple-100 text-purple-700 border-purple-200",
};

export function OffersPanel({ onViewMarketTrends }: { onViewMarketTrends: (city: string) => void }) {
  return (
    <div className="bg-gray-50 border-l border-gray-200 flex flex-col h-full">
      {/* ====== HAUT : CARTE SIMULÉE ====== */}
      <div className="relative h-1/4 min-h-[120px] border-b border-gray-200 group overflow-hidden">
        <img
          src="https://arc-anglerfish-eu-central-1-prod-leparisien.s3.amazonaws.com/public/5UAWECLJVFOXQS6RPEGA3XXU3M.jpg"
          alt="Carte des biens en cours"
          className="w-full h-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30 transition-opacity duration-300 group-hover:opacity-0" />

        {/* Texte overlay */}
        <div className="absolute bottom-3 left-4 right-4 text-white transition-opacity duration-300 group-hover:opacity-0">
          <p className="text-sm opacity-90">
            Vue géographique des avis en cours
          </p>
        </div>
      </div>

      {/* ====== INDICATEURS DE MARCHÉ ====== */}
      <MarketIndicators onCityClick={onViewMarketTrends} />

      {/* ====== BAS : VEILLE CONCURRENTIELLE ====== */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* En-tête */}
        <div className="bg-white border-b border-gray-200 px-6 py-5">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="text-lg text-gray-900">
                Nouvelles offres à proximité
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Dernières publications
              </p>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-3">
            <MapPin className="w-4 h-4" />
            <span>Grenoble</span>
          </div>
        </div>

        {/* Liste des offres */}
        <div className="h-[50vh] overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {mockOffers.map((offer) => (
              <a
                key={offer.id}
                href={offer.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer relative group"
              >
                {offer.isNew && (
                  <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-md">
                    NOUVEAU
                  </div>
                )}

                <ExternalLink className="absolute top-3 right-3 w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />

                <h4 className="text-sm text-gray-900 line-clamp-2 pr-6 mb-3">
                  {offer.title}
                </h4>

                <div className="text-xl text-blue-900 mb-3">
                  {offer.price}
                </div>

                <div className="mb-3">
                  <span
                    className={`inline-block text-xs px-2.5 py-1 rounded-md border ${
                      platformStyles[offer.platform]
                    }`}
                  >
                    {offer.platform}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                  <span>{offer.surface}</span>
                  <span>•</span>
                  <span>{offer.type}</span>
                </div>

                <div className="text-xs text-gray-400">
                  {offer.postedAt}
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Pied de page */}
        <div className="bg-white border-t border-gray-200 px-6 py-4 text-center">
          <a
            href="#"
            className="text-sm text-blue-900 hover:text-blue-800 inline-flex items-center gap-1"
          >
            Voir toutes les offres →
          </a>
        </div>
      </div>
    </div>
  );
}