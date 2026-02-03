import {
  Star,
  MapPin,
  ArrowUp,
  ArrowDown,
  Minus,
  CheckCircle2,
  Circle,
  Filter,
  TrendingUp,
  X,
  Search,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

interface Property {
  id: string;
  image: string;
  surface: number; // Surface en m²
  pricePerM2: number; // Prix au m²
  distance: number; // Distance en km
  similarity: number;
  type: string;
  address: string;
  rooms: string;
  constructionYear: string;
  renovationYear: string;
  marketPrice: string;
  marketPriceDate: string;
  observedPrice: string;
}

interface ValidatedComparable {
  property: Property;
  adjustment: number; // Pourcentage de recote (-100 à +100)
}

export function ComparisonStep() {
  // Biens en cours de comparaison (temporaires pour la comparaison détaillée)
  const [comparisonProperties, setComparisonProperties] =
    useState<Property[]>([]);

  // Biens comparables validés (définitifs)
  const [validatedComparables, setValidatedComparables] =
    useState<ValidatedComparable[]>([]);

  // Filtres de recherche
  const [surfaceMin, setSurfaceMin] = useState<string>("");
  const [surfaceMax, setSurfaceMax] = useState<string>("");
  const [maxDistance, setMaxDistance] = useState<string>("1");

  // Type de bien évalué (devrait venir des props)
  const evaluatedPropertyType = "bureaux";

  // Données simulées - biens comparables filtrés par type
  const allProperties: Property[] = [
    {
      id: "1",
      image:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400",
      surface: 280,
      pricePerM2: 3929,
      distance: 0.5,
      similarity: 94,
      type: "bureaux",
      address: "22 Rue de la République, 92100 Boulogne",
      rooms: "14 pièces",
      constructionYear: "2012",
      renovationYear: "2020",
      marketPrice: "1 100 000 €",
      marketPriceDate: "15/12/2025",
      observedPrice: "1 080 000 €",
    },
    {
      id: "2",
      image:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400",
      surface: 310,
      pricePerM2: 4355,
      distance: 0.8,
      similarity: 87,
      type: "bureaux",
      address: "45 Avenue Victor Hugo, 92200 Neuilly",
      rooms: "16 pièces",
      constructionYear: "2015",
      renovationYear: "2023",
      marketPrice: "1 350 000 €",
      marketPriceDate: "20/11/2025",
      observedPrice: "1 330 000 €",
    },
    {
      id: "3",
      image:
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400",
      surface: 250,
      pricePerM2: 3800,
      distance: 0.3,
      similarity: 82,
      type: "bureaux",
      address: "12 Boulevard Haussmann, 75009 Paris",
      rooms: "12 pièces",
      constructionYear: "2010",
      renovationYear: "2018",
      marketPrice: "950 000 €",
      marketPriceDate: "10/01/2026",
      observedPrice: "940 000 €",
    },
    {
      id: "4",
      image:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400",
      surface: 320,
      pricePerM2: 4100,
      distance: 1.2,
      similarity: 78,
      type: "bureaux",
      address: "78 Rue de Rivoli, 75001 Paris",
      rooms: "18 pièces",
      constructionYear: "2008",
      renovationYear: "2021",
      marketPrice: "1 312 000 €",
      marketPriceDate: "05/12/2025",
      observedPrice: "1 300 000 €",
    },
    {
      id: "5",
      image:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400",
      surface: 290,
      pricePerM2: 4200,
      distance: 0.6,
      similarity: 91,
      type: "bureaux",
      address: "88 Avenue Foch, 75016 Paris",
      rooms: "15 pièces",
      constructionYear: "2018",
      renovationYear: "2024",
      marketPrice: "1 218 000 €",
      marketPriceDate: "02/01/2026",
      observedPrice: "1 200 000 €",
    },
  ];

  // Biens recommandés par l'IA (top 3 par similarité)
  const aiRecommendedProperties = allProperties
    .filter((p) => p.type === evaluatedPropertyType)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3);

  // Filtrer les biens selon les critères de recherche
  const filteredProperties = allProperties.filter(
    (property) => {
      // Filtre par type (uniquement même typologie)
      if (property.type !== evaluatedPropertyType) return false;

      // Filtre par surface
      if (surfaceMin && property.surface < parseInt(surfaceMin))
        return false;
      if (surfaceMax && property.surface > parseInt(surfaceMax))
        return false;

      // Filtre par distance
      if (
        maxDistance &&
        property.distance > parseFloat(maxDistance)
      )
        return false;

      return true;
    },
  );

  // Calculer le prix moyen au m² de la zone (tous les biens dans 1km)
  const propertiesIn1km = allProperties.filter(
    (p) => p.type === evaluatedPropertyType && p.distance <= 1,
  );
  const avgPricePerM2In1km =
    propertiesIn1km.length > 0
      ? Math.round(
          propertiesIn1km.reduce(
            (sum, p) => sum + p.pricePerM2,
            0,
          ) / propertiesIn1km.length,
        )
      : 0;

  // Calculer le prix moyen au m² des biens comparables validés
  const avgPriceValidatedComparables =
    validatedComparables.length > 0
      ? Math.round(
          validatedComparables.reduce(
            (sum, c) => sum + c.property.pricePerM2,
            0,
          ) / validatedComparables.length,
        )
      : 0;

  // Ajouter un bien pour comparaison (temporaire)
  const handleAddForComparison = (property: Property) => {
    // Vérifier si le bien n'est pas déjà en comparaison
    if (
      comparisonProperties.find((p) => p.id === property.id)
    ) {
      return;
    }
    // Maximum 3 biens en comparaison
    if (comparisonProperties.length >= 3) {
      alert("Vous pouvez comparer jusqu'à 3 biens à la fois");
      return;
    }
    setComparisonProperties([
      ...comparisonProperties,
      property,
    ]);
  };

  // Retirer un bien de la comparaison
  const handleRemoveFromComparison = (propertyId: string) => {
    setComparisonProperties(
      comparisonProperties.filter((p) => p.id !== propertyId),
    );
  };

  // Valider un bien comme comparable (définitif)
  const handleValidateComparable = (property: Property) => {
    // Vérifier si le bien n'est pas déjà validé
    if (
      validatedComparables.find(
        (c) => c.property.id === property.id,
      )
    ) {
      return;
    }
    // Ajouter aux biens validés
    setValidatedComparables([
      ...validatedComparables,
      { property, adjustment: 0 },
    ]);
    // Retirer de la comparaison temporaire
    handleRemoveFromComparison(property.id);
  };

  // Retirer un bien validé
  const handleRemoveValidated = (propertyId: string) => {
    setValidatedComparables(
      validatedComparables.filter(
        (c) => c.property.id !== propertyId,
      ),
    );
  };

  // Modifier l'ajustement d'un bien validé
  const handleAdjustmentChange = (
    propertyId: string,
    adjustment: number,
  ) => {
    setValidatedComparables(
      validatedComparables.map((c) =>
        c.property.id === propertyId ? { ...c, adjustment } : c,
      ),
    );
  };

  const comparisonData = {
    evaluated: {
      image:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600",
      address: "15 Avenue Charles de Gaulle, 92200 Neuilly",
      type: "Bureaux",
      surface: "280 m²",
      rooms: "12 pièces",
      constructionYear: "2015",
      renovationYear: "2022",
      pricePerM2: "À estimer",
      marketPrice: "À estimer",
      marketPriceDate: "-",
      observedPrice: "À estimer",
    },
  };

  return (
    <div className="flex gap-6">
      {/* Colonne gauche - Moteur de recherche (15%) */}
      <div className="w-[15%]">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm text-gray-900 font-medium">
              Moteur de recherche
            </h3>
          </div>

          <div className="space-y-4">
            {/* Filtre Surface */}
            <div>
              <label className="block text-xs text-gray-700 mb-2 font-medium">
                Surface (m²)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={surfaceMin}
                  onChange={(e) =>
                    setSurfaceMin(e.target.value)
                  }
                  className="px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={surfaceMax}
                  onChange={(e) =>
                    setSurfaceMax(e.target.value)
                  }
                  className="px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filtre Distance */}
            <div>
              <label className="block text-xs text-gray-700 mb-2 font-medium">
                Distance max (km)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="Ex: 1.5"
                value={maxDistance}
                onChange={(e) => setMaxDistance(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={() => {
                setSurfaceMin("");
                setSurfaceMax("");
                setMaxDistance("1");
              }}
              className="w-full px-2 py-1.5 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors"
            >
              Réinitialiser
            </button>
          </div>

          {/* Résultats de recherche */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-3">
              <span className="font-semibold text-blue-700">
                {filteredProperties.length}
              </span>{" "}
              bien{filteredProperties.length > 1 ? "s" : ""}{" "}
              trouvé
              {filteredProperties.length > 1 ? "s" : ""}
            </p>

            <div className="space-y-2 max-h-[350px] overflow-y-auto">
              {filteredProperties.map((property) => {
                const isInComparison =
                  comparisonProperties.some(
                    (p) => p.id === property.id,
                  );
                const isValidated = validatedComparables.some(
                  (c) => c.property.id === property.id,
                );

                return (
                  <div
                    key={property.id}
                    className={`border rounded-lg overflow-hidden transition-all ${
                      isInComparison
                        ? "border-orange-400 bg-orange-50"
                        : isValidated
                          ? "border-green-400 bg-green-50"
                          : "border-gray-200 hover:border-blue-500"
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={property.image}
                        alt="Bien"
                        className="w-full h-16 object-cover"
                      />
                      <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                        {property.similarity}%
                      </div>
                    </div>

                    <div className="p-2">
                      <p className="text-xs text-gray-900 font-medium mb-1">
                        {property.surface} m² •{" "}
                        {property.distance} km
                      </p>
                      <p className="text-xs text-blue-900 font-semibold mb-2">
                        {property.pricePerM2.toLocaleString()}{" "}
                        €/m²
                      </p>
                      <button
                        onClick={() =>
                          handleAddForComparison(property)
                        }
                        disabled={isInComparison || isValidated}
                        className={`w-full px-2 py-1 rounded text-xs transition-colors ${
                          isInComparison
                            ? "bg-orange-200 text-orange-700 cursor-not-allowed"
                            : isValidated
                              ? "bg-green-200 text-green-700 cursor-not-allowed"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {isInComparison
                          ? "En comparaison"
                          : isValidated
                            ? "Validé"
                            : "Comparer"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Colonne centrale - Recommandations IA (15%) */}
      <div className="w-[15%]">
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="text-sm text-purple-900 font-medium">
              Recommandations IA
            </h3>
          </div>

          <p className="text-xs text-purple-700 mb-4">
            Biens les plus similaires sélectionnés par l'IA
          </p>

          <div className="space-y-2">
            {aiRecommendedProperties.map((property, index) => {
              const isInComparison = comparisonProperties.some(
                (p) => p.id === property.id,
              );
              const isValidated = validatedComparables.some(
                (c) => c.property.id === property.id,
              );

              return (
                <div
                  key={property.id}
                  className={`border-2 rounded-lg overflow-hidden transition-all ${
                    isInComparison
                      ? "border-orange-400 bg-orange-50"
                      : isValidated
                        ? "border-green-400 bg-green-50"
                        : "border-purple-300 bg-white hover:border-purple-500"
                  }`}
                >
                  <div className="relative">
                    <img
                      src={property.image}
                      alt="Bien"
                      className="w-full h-16 object-cover"
                    />
                    <div className="absolute top-1 left-1 bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-white" />#
                      {index + 1}
                    </div>
                    <div className="absolute top-1 right-1 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                      {property.similarity}%
                    </div>
                  </div>

                  <div className="p-2">
                    <p className="text-xs text-gray-900 font-medium mb-1">
                      {property.surface} m² •{" "}
                      {property.distance} km
                    </p>
                    <p className="text-xs text-purple-900 font-semibold mb-2">
                      {property.pricePerM2.toLocaleString()}{" "}
                      €/m²
                    </p>
                    <button
                      onClick={() =>
                        handleAddForComparison(property)
                      }
                      disabled={isInComparison || isValidated}
                      className={`w-full px-2 py-1 rounded text-xs transition-colors font-medium ${
                        isInComparison
                          ? "bg-orange-200 text-orange-700 cursor-not-allowed"
                          : isValidated
                            ? "bg-green-200 text-green-700 cursor-not-allowed"
                            : "bg-purple-600 text-white hover:bg-purple-700"
                      }`}
                    >
                      {isInComparison
                        ? "En comparaison"
                        : isValidated
                          ? "Validé"
                          : "Comparer"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Colonne principale (70%) */}
      <div className="flex-1">
        {/* Prix moyen de la zone géographique uniquement */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5" />
              <p className="text-sm opacity-90">
                Prix moyen de la zone géographique (1 km)
              </p>
            </div>
            <p className="text-3xl font-bold">
              {avgPricePerM2In1km.toLocaleString()} €/m²
            </p>
            <p className="text-xs opacity-75 mt-1">
              Basé sur {propertiesIn1km.length} bien
              {propertiesIn1km.length > 1 ? "s" : ""} de type{" "}
              {evaluatedPropertyType}
            </p>
          </div>
        </div>

        {/* Carte */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 h-[350px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg text-gray-900">
              Carte interactive
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                <span>Bien évalué</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <span>Biens comparables</span>
              </div>
            </div>
          </div>

          {/* Carte simulée */}
          <div className="relative w-full h-[250px] bg-gray-100 rounded-lg overflow-hidden">
            <img
              src="https://arc-anglerfish-eu-central-1-prod-leparisien.s3.amazonaws.com/public/5UAWECLJVFOXQS6RPEGA3XXU3M.jpg"
              alt="Carte"
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-white/10"></div>

            {/* Cercle de rayon 1km */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-4 border-red-500 border-dashed rounded-full opacity-40"></div>

            {/* Marqueur rouge (bien évalué) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <MapPin className="w-8 h-8 text-red-600 fill-red-600 drop-shadow-lg" />
            </div>

            {/* Marqueurs bleus (biens comparables) - affichant le prix/m² */}
            <div className="absolute top-[35%] left-[45%] flex flex-col items-center">
              <MapPin className="w-6 h-6 text-blue-600 fill-blue-600 drop-shadow-lg" />
              <span className="bg-white px-2 py-1 rounded shadow-md text-xs font-medium mt-1 border border-gray-200">
                3 929 €/m²
              </span>
            </div>
            <div className="absolute top-[60%] left-[55%] flex flex-col items-center">
              <MapPin className="w-6 h-6 text-blue-600 fill-blue-600 drop-shadow-lg" />
              <span className="bg-white px-2 py-1 rounded shadow-md text-xs font-medium mt-1 border border-gray-200">
                4 355 €/m²
              </span>
            </div>
            <div className="absolute top-[45%] left-[62%] flex flex-col items-center">
              <MapPin className="w-6 h-6 text-blue-600 fill-blue-600 drop-shadow-lg" />
              <span className="bg-white px-2 py-1 rounded shadow-md text-xs font-medium mt-1 border border-gray-200">
                3 800 €/m²
              </span>
            </div>
          </div>
        </div>

        {/* Comparaison détaillée (biens en cours de comparaison) */}
        {comparisonProperties.length > 0 ? (
          <div className="bg-white rounded-lg border-2 border-orange-300 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg text-gray-900 flex items-center gap-2">
                  Comparaison détaillée
                  <span className="text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded">
                    En cours
                  </span>
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  {comparisonProperties.length} bien
                  {comparisonProperties.length > 1 ? "s" : ""}{" "}
                  en comparaison (max. 3)
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm text-gray-600 font-medium">
                      Critère
                    </th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600 font-medium">
                      Bien évalué
                    </th>
                    {comparisonProperties.map(
                      (property, index) => (
                        <th
                          key={property.id}
                          className="text-left py-3 px-4 text-sm text-gray-600 font-medium"
                        >
                          <div className="flex items-center justify-between">
                            <span>
                              En comparaison {index + 1}
                            </span>
                            <button
                              onClick={() =>
                                handleRemoveFromComparison(
                                  property.id,
                                )
                              }
                              className="ml-2 p-1 hover:bg-red-50 rounded transition-colors"
                            >
                              <X className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      Photo
                    </td>
                    <td className="py-3 px-4">
                      <img
                        src={comparisonData.evaluated.image}
                        alt="Bien évalué"
                        className="w-20 h-14 object-cover rounded"
                      />
                    </td>
                    {comparisonProperties.map((property) => (
                      <td
                        key={property.id}
                        className="py-3 px-4"
                      >
                        <img
                          src={property.image}
                          alt="Comparable"
                          className="w-20 h-14 object-cover rounded"
                        />
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      Adresse
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {comparisonData.evaluated.address}
                    </td>
                    {comparisonProperties.map((property) => (
                      <td
                        key={property.id}
                        className="py-3 px-4 text-sm text-gray-900"
                      >
                        {property.address}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      Type
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {comparisonData.evaluated.type}
                    </td>
                    {comparisonProperties.map((property) => (
                      <td
                        key={property.id}
                        className="py-3 px-4 text-sm text-gray-900"
                      >
                        {property.type.charAt(0).toUpperCase() +
                          property.type.slice(1)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      Surface
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {comparisonData.evaluated.surface}
                    </td>
                    {comparisonProperties.map((property) => (
                      <td
                        key={property.id}
                        className="py-3 px-4 text-sm text-gray-900"
                      >
                        {property.surface} m²
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      Pièces
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {comparisonData.evaluated.rooms}
                    </td>
                    {comparisonProperties.map((property) => (
                      <td
                        key={property.id}
                        className="py-3 px-4 text-sm text-gray-900"
                      >
                        {property.rooms}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      Année de construction
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {
                        comparisonData.evaluated
                          .constructionYear
                      }
                    </td>
                    {comparisonProperties.map((property) => (
                      <td
                        key={property.id}
                        className="py-3 px-4 text-sm text-gray-900"
                      >
                        {property.constructionYear}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      Année derniers travaux
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {comparisonData.evaluated.renovationYear}
                    </td>
                    {comparisonProperties.map((property) => (
                      <td
                        key={property.id}
                        className="py-3 px-4 text-sm text-gray-900"
                      >
                        {property.renovationYear}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      Prix/m²
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-blue-900">
                      {comparisonData.evaluated.pricePerM2}
                    </td>
                    {comparisonProperties.map((property) => (
                      <td
                        key={property.id}
                        className="py-3 px-4 text-sm font-medium text-blue-900"
                      >
                        {property.pricePerM2.toLocaleString()}{" "}
                        €/m²
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      Prix du marché
                    </td>
                    <td className="py-3 px-4 text-base font-semibold text-blue-900">
                      {comparisonData.evaluated.marketPrice}
                      <p className="text-xs text-gray-500 font-normal mt-1">
                        {
                          comparisonData.evaluated
                            .marketPriceDate
                        }
                      </p>
                    </td>
                    {comparisonProperties.map((property) => (
                      <td
                        key={property.id}
                        className="py-3 px-4 text-base font-semibold text-blue-900"
                      >
                        {property.marketPrice}
                        <p className="text-xs text-gray-500 font-normal mt-1">
                          {property.marketPriceDate}
                        </p>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      Prix constaté
                    </td>
                    <td className="py-3 px-4 text-base font-semibold text-green-700">
                      {comparisonData.evaluated.observedPrice}
                    </td>
                    {comparisonProperties.map((property) => (
                      <td
                        key={property.id}
                        className="py-3 px-4 text-base font-semibold text-green-700"
                      >
                        {property.observedPrice}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-sm text-gray-700 font-medium">
                      Actions
                    </td>
                    <td className="py-3 px-4"></td>
                    {comparisonProperties.map((property) => (
                      <td
                        key={property.id}
                        className="py-3 px-4"
                      >
                        <button
                          onClick={() =>
                            handleValidateComparable(property)
                          }
                          className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          Valider comme comparable
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center mb-6">
            <p className="text-gray-500">
              Sélectionnez des biens depuis le moteur de
              recherche ou les recommandations IA pour commencer
              la comparaison
            </p>
          </div>
        )}

        {/* Biens comparables validés (en dessous de la comparaison détaillée) */}
        {validatedComparables.length > 0 && (
          <div className="bg-white rounded-lg border-2 border-green-300 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg text-gray-900 flex items-center gap-2">
                  Biens comparables validés
                  <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                    {validatedComparables.length}
                  </span>
                </h3>
                <div className="flex items-center gap-4 mt-2">
                  <div className="bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                    <p className="text-xs text-green-700 mb-1">
                      Prix moyen des comparables validés
                    </p>
                    <p className="text-xl text-green-900 font-bold">
                      {avgPriceValidatedComparables.toLocaleString()}{" "}
                      €/m²
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {validatedComparables.map((comparable) => (
                <div
                  key={comparable.property.id}
                  className="flex items-center gap-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg"
                >
                  <img
                    src={comparable.property.image}
                    alt="Comparable"
                    className="w-20 h-16 object-cover rounded flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium truncate">
                      {comparable.property.address}
                    </p>
                    <p className="text-xs text-gray-600">
                      {comparable.property.surface} m² •
                      Distance: {comparable.property.distance}{" "}
                      km
                    </p>
                    <p className="text-sm text-blue-900 font-semibold mt-1">
                      Prix initial:{" "}
                      {comparable.property.pricePerM2.toLocaleString()}{" "}
                      €/m²
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                      <label className="text-xs text-gray-700 mb-1 font-medium">
                        Decote (%)
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="-100"
                          max="100"
                          step="1"
                          value={comparable.adjustment}
                          onChange={(e) =>
                            handleAdjustmentChange(
                              comparable.property.id,
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="w-20 px-2 py-1.5 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-600">
                          %
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end ml-2">
                      <p className="text-xs text-gray-600 mb-1">
                        Prix ajusté
                      </p>
                      <p className="text-lg font-bold text-green-700">
                        {Math.round(
                          comparable.property.pricePerM2 *
                            (1 + comparable.adjustment / 100),
                        ).toLocaleString()}{" "}
                        €/m²
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleRemoveValidated(
                        comparable.property.id,
                      )
                    }
                    className="p-2 hover:bg-red-50 rounded transition-colors"
                    title="Retirer ce comparable"
                  >
                    <X className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}