import {
  Calculator,
  TrendingUp,
  Home,
  Percent,
} from "lucide-react";
import { useState } from "react";

export function AnalysisStep() {
  // États pour les prix de vente (fourchette haute/basse)
  const [selectedSalePrice, setSelectedSalePrice] =
    useState(2580);
  const [capRate, setCapRate] = useState(8.0);

  // États pour les prix de loyer (fourchette haute/basse)
  const [selectedRentPrice, setSelectedRentPrice] =
    useState(72);
  const [capRate2, setCapRate2] = useState(8.0);

  // Données fixes
  const SURFACE_TOTALE = 930; // m²

  // Biens comparables
  const comparables = [
    {
      type: "Bureaux",
      surface: 250,
      price: 980000,
      trend: 2.5,
      image:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400",
    },
    {
      type: "Commerce",
      surface: 180,
      price: 650000,
      trend: -1.8,
      image:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400",
    },
    {
      type: "Entrepôt",
      surface: 450,
      price: 540000,
      trend: 4.1,
      image:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400",
    },
    {
      type: "Bureaux",
      surface: 300,
      price: 1200000,
      trend: 1.2,
      image:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400",
    },
    {
      type: "Commerce",
      surface: 150,
      price: 720000,
      trend: -0.5,
      image:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400",
    },
  ];

  // Calculs des moyennes
  const avgPricePerM2 =
    comparables.reduce(
      (sum, c) => sum + c.price / c.surface,
      0,
    ) / comparables.length;

  // Calcul loyer estimé depuis prix de vente
  const estimatedAnnualRent =
    (selectedSalePrice * capRate) / 100;
  const estimatedMonthlyRent = estimatedAnnualRent / 12;

  // Calcul prix de vente estimé depuis loyer
  const estimatedSalePrice =
    (selectedRentPrice * 100) / capRate;
  const estimatedPricePerM2 =
    estimatedSalePrice * SURFACE_TOTALE;

  return (
    <div className="space-y-6">
      {/* ZONE PRINCIPALE - 2 colonnes 70% / 30% */}
      {/* 1. TABLEAU DE SYNTHÈSE */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg text-gray-900 mb-4 font-medium">
          Tableau de Synthèse
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-900 text-white">
                <th className="text-left py-3 px-4 text-sm font-medium">
                  Type
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium">
                  Surface
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium">
                  Prix/m²
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium">
                  V. Locative/m²
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium">
                  V. Vénale HD
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium">
                  V. Locative/an
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium">
                  V. Locative/mois
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-sm text-gray-900">
                  🏢 Bureaux
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 text-center">
                  280 m²
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 text-right">
                  3 928 €
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 text-right">
                  110 €
                </td>
                <td className="py-3 px-4 text-sm text-blue-900 font-medium text-right">
                  1 100 000 €
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 text-right">
                  70 000 €
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 text-right">
                  5 833 €
                </td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-sm text-gray-900">
                  🏪 Commerce
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 text-center">
                  150 m²
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 text-right">
                  4 666 €
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 text-right">
                  80 €
                </td>
                <td className="py-3 px-4 text-sm text-blue-900 font-medium text-right">
                  700 000 €
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 text-right">
                  52 500 €
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 text-right">
                  4 375 €
                </td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-sm text-gray-900">
                  🏭 Entrepôt
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 text-center">
                  500 m²
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 text-right">
                  1 200 €
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 text-right">
                  50 €
                </td>
                <td className="py-3 px-4 text-sm text-blue-900 font-medium text-right">
                  600 000 €
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 text-right">
                  40 000 €
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 text-right">
                  3 333 €
                </td>
              </tr>
              <tr className="bg-green-600 text-white font-semibold">
                <td className="py-4 px-4 text-sm">TOTAUX</td>
                <td className="py-4 px-4 text-sm text-center">
                  930 m²
                </td>
                <td className="py-4 px-4 text-sm text-right">
                  3264
                </td>
                <td className="py-4 px-4 text-sm text-right">
                  80 €
                </td>
                <td className="py-4 px-4 text-base font-bold text-right">
                  2 400 000 €
                </td>
                <td className="py-4 px-4 text-base font-bold text-right">
                  162 500 €
                </td>
                <td className="py-4 px-4 text-base font-bold text-right">
                  13 541 €
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="grid grid-cols-10 gap-6">
        {/* COLONNE GAUCHE - 70% (7 colonnes) */}
        <div className="col-span-7 space-y-6">
          {/* 2. ESTIMATION LOYER DE MARCHÉ DEPUIS PRIX DE VENTE */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg text-gray-900 mb-4 font-medium">
              Estimation du Loyer de Marché (depuis Prix de
              Vente)
            </h3>

            <div className="grid grid-cols-3 gap-6">
              {/* DROITE - Fourchette prix de vente */}
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Prix de Vente Constaté
                </p>

                <div className="space-y-2">
                  {[
                    {
                      label: "Fourchette Basse",
                      price: 2200,
                    },
                    {
                      label: "Fourchette Haute",
                      price: 2580,
                    },
                  ].map((item) => (
                    <button
                      key={item.price}
                      onClick={() =>
                        setSelectedSalePrice(item.price)
                      }
                      className={`
          w-full py-2 px-3 rounded border text-sm transition
          ${
            selectedSalePrice === item.price
              ? "bg-blue-100 border-blue-400 text-blue-900 font-semibold"
              : "bg-gray-50 border-gray-200 hover:bg-gray-100"
          }
        `}
                    >
                      <div className="flex justify-between">
                        <span>{item.label}</span>
                        <span>
                          {item.price.toLocaleString("fr-FR")} €
                        </span>
                      </div>
                    </button>
                  ))}

                  {/* Valeur personnalisée */}
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        !selectedSalePrice ||
                        selectedSalePrice === 2200 ||
                        selectedSalePrice === 2580
                      ) {
                        setSelectedSalePrice("");
                      }
                    }}
                    className={`
        w-full py-2 px-3 rounded border text-sm transition text-left
        ${
          selectedSalePrice &&
          selectedSalePrice !== 2200 &&
          selectedSalePrice !== 2580
            ? "bg-blue-100 border-blue-400 text-blue-900 font-semibold"
            : "bg-gray-50 border-gray-200 hover:bg-gray-100"
        }
      `}
                  >
                    <div className="flex justify-between items-center">
                      <span>Valeur personnalisée</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        className="
            w-28 text-right bg-transparent outline-none
            appearance-none
            [appearance:textfield]
            [&::-webkit-inner-spin-button]:appearance-none
            [&::-webkit-outer-spin-button]:appearance-none
          "
                        placeholder="€"
                        value={
                          selectedSalePrice &&
                          selectedSalePrice !== 2200 &&
                          selectedSalePrice !== 2580
                            ? selectedSalePrice
                            : ""
                        }
                        onChange={(e) =>
                          setSelectedSalePrice(
                            Number(e.target.value),
                          )
                        }
                      />
                    </div>
                  </button>
                </div>
              </div>

              {/* MILIEU - Taux de capitalisation */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <label className="text-sm text-gray-600 block mb-2">
                  Taux de Capitalisation (%)
                </label>
                <input
                  type="number"
                  value={capRate}
                  onChange={(e) =>
                    setCapRate(parseFloat(e.target.value) || 0)
                  }
                  step="0.1"
                  min="0"
                  max="20"
                  className="w-full text-2xl font-bold text-blue-900 bg-white border border-blue-300 rounded px-3 py-2 text-center"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Rendement voulu
                </p>
              </div>

              {/* GAUCHE - Loyer estimé */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-sm text-gray-600 mb-2">
                  Loyer de Marché Estimé
                </p>
                <p className="text-3xl font-bold text-green-600 mb-1">
                  {estimatedAnnualRent.toLocaleString("fr-FR", {
                    maximumFractionDigits: 0,
                  })}{" "}
                  €
                </p>
                <p className="text-xs text-gray-500">par an</p>
              </div>
            </div>
          </div>

          {/* 3. ESTIMATION PRIX DE VENTE DE MARCHÉ DEPUIS LOYER */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="grid grid-cols-3 gap-6">
              {/* DROITE - Fourchette prix de vente */}
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Loyer Constaté
                </p>

                <div className="space-y-2">
                  {[
                    {
                      label: "Fourchette Basse",
                      price: 70,
                    },
                    {
                      label: "Fourchette Haute",
                      price: 90,
                    },
                  ].map((item) => (
                    <button
                      key={item.price}
                      onClick={() =>
                        setSelectedRentPrice(item.price)
                      }
                      className={`
          w-full py-2 px-3 rounded border text-sm transition
          ${
            selectedRentPrice === item.price
              ? "bg-blue-100 border-blue-400 text-blue-900 font-semibold"
              : "bg-gray-50 border-gray-200 hover:bg-gray-100"
          }
        `}
                    >
                      <div className="flex justify-between">
                        <span>{item.label}</span>
                        <span>
                          {item.price.toLocaleString("fr-FR")} €
                        </span>
                      </div>
                    </button>
                  ))}

                  {/* Valeur personnalisée */}
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        !selectedRentPrice ||
                        selectedRentPrice === 70 ||
                        selectedRentPrice === 90
                      ) {
                        setSelectedRentPrice("");
                      }
                    }}
                    className={`
        w-full py-2 px-3 rounded border text-sm transition text-left
        ${
          selectedRentPrice &&
          selectedRentPrice !== 70 &&
          selectedRentPrice !== 90
            ? "bg-blue-100 border-blue-400 text-blue-900 font-semibold"
            : "bg-gray-50 border-gray-200 hover:bg-gray-100"
        }
      `}
                  >
                    <div className="flex justify-between items-center">
                      <span>Valeur personnalisée</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        className="
            w-28 text-right bg-transparent outline-none
            appearance-none
            [appearance:textfield]
            [&::-webkit-inner-spin-button]:appearance-none
            [&::-webkit-outer-spin-button]:appearance-none
          "
                        placeholder="€"
                        value={
                          selectedRentPrice &&
                          selectedRentPrice !== 70 &&
                          selectedRentPrice !== 90
                            ? selectedRentPrice
                            : ""
                        }
                        onChange={(e) =>
                          setSelectedRentPrice(
                            Number(e.target.value),
                          )
                        }
                      />
                    </div>
                  </button>
                </div>
              </div>

              {/* MILIEU - Taux de capitalisation */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <label className="text-sm text-gray-600 block mb-2">
                  Taux de Capitalisation (%)
                </label>
                <input
                  type="number"
                  value={capRate}
                  onChange={(e) =>
                    setCapRate(parseFloat(e.target.value) || 0)
                  }
                  step="0.1"
                  min="0"
                  max="20"
                  className="w-full text-2xl font-bold text-blue-900 bg-white border border-blue-300 rounded px-3 py-2 text-center"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Rendement voulu
                </p>
              </div>
              {/* GAUCHE - Prix de vente estimé */}
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <p className="text-sm text-gray-600 mb-2">
                  Prix de Vente de Marché Estimé
                </p>
                <p className="text-3xl font-bold text-purple-600 mb-1">
                  {estimatedSalePrice.toLocaleString("fr-FR", {
                    maximumFractionDigits: 0,
                  })}{" "}
                  €/m²
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  valeur totale
                </p>
                <p className="text-xl font-semibold text-purple-700">
                  {estimatedPricePerM2.toLocaleString("fr-FR", {
                    maximumFractionDigits: 0,
                  })}{" "}
                  €
                </p>
                <p className="text-xs text-gray-500">
                  prix au m²
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* COLONNE DROITE - 30% (3 colonnes) */}
        <div className="col-span-3">
          <div
            className="
      bg-white rounded-lg border border-gray-200 p-4
      sticky top-4
      max-h-[calc(100vh-2rem)]
      flex flex-col
    "
          >
            <h3 className="text-base text-gray-900 font-medium mb-4">
              Biens Comparables
            </h3>

            {/* Liste scrollable */}
            <div className="space-y-3 mb-4 overflow-y-auto flex-1 pr-1">
              {comparables.map((comp, index) => (
                <div
                  key={index}
                  className="
        border border-gray-100 rounded-lg overflow-hidden
        flex h-24 bg-white
      "
                >
                  {/* Texte - gauche */}
                  <div className="w-1/2 p-3 flex flex-col justify-between">
                    {/* Haut */}
                    <div>
                      <p className="text-xs text-gray-600">
                        {comp.type} • {comp.surface}m²
                      </p>
                    </div>

                    {/* Bas */}
                    <div>
                      <p className="text-sm font-semibold text-blue-900">
                        {(
                          comp.price / comp.surface
                        ).toLocaleString("fr-FR", {
                          maximumFractionDigits: 0,
                        })}{" "}
                        €/m²
                      </p>
                      <p className="text-xs text-gray-500">
                        {comp.price.toLocaleString("fr-FR")} €
                      </p>
                    </div>
                  </div>

                  {/* Image - droite */}
                  <div className="w-1/2 overflow-hidden rounded-r-xl">
                    <img
                      src={comp.image}
                      alt={comp.type}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Prix moyen - toujours visible */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 shrink-0">
              <p className="text-sm text-gray-600 mb-2">
                Prix Moyen au m²
              </p>
              <p className="text-2xl font-bold text-blue-900">
                {avgPricePerM2.toLocaleString("fr-FR", {
                  maximumFractionDigits: 0,
                })}{" "}
                €/m²
              </p>

              <div className="mt-3 pt-3 border-t border-blue-300">
                <p className="text-xs text-gray-600 mb-1">
                  Loyer estimé (à {capRate}%)
                </p>
                <p className="text-lg font-semibold text-blue-800">
                  {(
                    (avgPricePerM2 * capRate) /
                    100 /
                    3
                  ).toLocaleString("fr-FR", {
                    maximumFractionDigits: 0,
                  })}{" "}
                  €/mois
                </p>
                <p className="text-xs text-gray-500">
                  {(
                    (avgPricePerM2 * SURFACE_TOTALE * capRate) /
                    100
                  ).toLocaleString("fr-FR", {
                    maximumFractionDigits: 0,
                  })}{" "}
                  €/an
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}