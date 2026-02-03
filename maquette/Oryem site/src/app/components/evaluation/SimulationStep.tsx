import {
  Calculator,
  TrendingUp,
  Home,
  Percent,
} from "lucide-react";
import { useState } from "react";

export function SimulationStep() {
  // États pour les calculatrices
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [interestRate, setInterestRate] = useState(3.5);
  const [insurance, setInsurance] = useState(0.3);
  const [selectedPrice, setSelectedPrice] = useState(780);
  const [selectedPrice2, setSelectedPrice2] = useState(780);
  const [years, setYears] = useState(20);

  // Calcul mensualité
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = years * 12;
  const monthlyPayment =
    (loanAmount *
      monthlyRate *
      Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);
  const monthlyInsurance =
    (loanAmount * (insurance / 100)) / 12;
  const totalMonthly = monthlyPayment + monthlyInsurance;

  //Logique métier
  const SURFACE_TOTALE = 930; // m²
  const TAUX_CAPITALISATION = 0.08; // 8%
  const PRIX_ACHAT = 2400000; //

  const annualRent = selectedPrice * SURFACE_TOTALE;

  const monthlyRent = annualRent / 12;
  const estimatedValue = annualRent / TAUX_CAPITALISATION;
  const resaleValue = selectedPrice2 * SURFACE_TOTALE;

  return (
    <div className="space-y-6">
      {/* ZONE INFÉRIEURE - 4 colonnes */}
      <div className="grid grid-cols-3 gap-6">
        {/* COLONNE 1 - Simulations */}
        <div className="space-y-4">
          {/* Réserve Foncière */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h4 className="text-base text-gray-900 font-medium mb-3">
              Réserve Foncière
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Surface terrain
                </span>
                <input
                  type="number"
                  defaultValue="1200"
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                />
                <span className="text-gray-600">m²</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Prix foncier/m²
                </span>
                <input
                  type="number"
                  defaultValue="500"
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                />
                <span className="text-gray-600">€</span>
              </div>
              <div className="pt-2 mt-2 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-900 font-medium">
                    Valeur foncière
                  </span>
                  <span className="text-lg text-blue-900 font-bold">
                    600 000 €
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Calculatrice Capacité d'Emprunt */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-900" />
              <h4 className="text-base text-gray-900 font-medium">
                Capacité d'Emprunt
              </h4>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Revenus mensuels
                </span>
                <input
                  type="number"
                  defaultValue="8000"
                  className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Charges mensuelles
                </span>
                <input
                  type="number"
                  defaultValue="1500"
                  className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                />
              </div>
              <div className="pt-2 mt-3 border-t border-gray-200">
                <p className="text-xs text-gray-600">
                  Capacité totale
                </p>
                <p className="text-2xl text-green-600 font-bold">
                  1 580 000 €
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* COLONNE 2 - Emprunt & Travaux */}
        <div className="space-y-4">
          {/* Calculatrice Mensualités */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-blue-900" />
              <h4 className="text-base text-gray-900 font-medium">
                Financement
              </h4>
            </div>
            <div className="space-y-2">
              {/* Ligne label / valeur */}
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-600">
                  Montant
                </label>

                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) =>
                    setLoanAmount(Number(e.target.value))
                  }
                  className="
        w-20 px-3 py-2 text-xs text-right font-medium
        bg-gray-50/60 backdrop-blur-sm
        border border-gray-200/50 rounded-md
        focus:outline-none focus:ring-1 focus:ring-blue-300
        [appearance:textfield]
        [&::-webkit-inner-spin-button]:appearance-none
        [&::-webkit-outer-spin-button]:appearance-none
      "
                />
              </div>

              {/* Slider */}
              <input
                type="range"
                min="100000"
                max="5000000"
                step="50000"
                value={loanAmount}
                onChange={(e) =>
                  setLoanAmount(Number(e.target.value))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-900"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>100 000 €</span>
                <span>5 000 000 €</span>
              </div>

              {/*=====Interet========*/}
              {/* Ligne label / valeur */}
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-600">
                  Taux :
                </label>

                <input
                  type="number"
                  value={interestRate}
                  onChange={(e) =>
                    setInterestRate(Number(e.target.value))
                  }
                  className="
        w-20 px-3 py-2 text-xs text-right font-medium
        bg-gray-50/60 backdrop-blur-sm
        border border-gray-200/50 rounded-md
        focus:outline-none focus:ring-1 focus:ring-blue-300
        [appearance:textfield]
        [&::-webkit-inner-spin-button]:appearance-none
        [&::-webkit-outer-spin-button]:appearance-none
      "
                />
              </div>

              {/* Slider */}
              <input
                type="range"
                min="0.5"
                max="6"
                step="0.1"
                value={interestRate}
                onChange={(e) =>
                  setInterestRate(Number(e.target.value))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-900"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>0.5%</span>
                <span>6%</span>
              </div>

              {/*==========Assurance=========*/}

              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-600">
                  Assurance :
                </label>
                <input
                  type="number"
                  value={insurance}
                  onChange={(e) =>
                    setInsurance(Number(e.target.value))
                  }
                  className="
        w-20 px-3 py-2 text-xs text-right font-medium
        bg-gray-50/60 backdrop-blur-sm
        border border-gray-200/50 rounded-md
        focus:outline-none focus:ring-1 focus:ring-blue-300
        [appearance:textfield]
        [&::-webkit-inner-spin-button]:appearance-none
        [&::-webkit-outer-spin-button]:appearance-none
      "
                />
              </div>

              {/* Slider */}
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={insurance}
                onChange={(e) =>
                  setInsurance(Number(e.target.value))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-900"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>0</span>
                <span>1</span>
              </div>

              {/*==========Duree=========*/}

              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-600">
                  Durée :
                </label>
                <input
                  type="number"
                  value={years}
                  onChange={(e) =>
                    setYears(Number(e.target.value))
                  }
                  className="
        w-20 px-3 py-2 text-xs text-right font-medium
        bg-gray-50/60 backdrop-blur-sm
        border border-gray-200/50 rounded-md
        focus:outline-none focus:ring-1 focus:ring-blue-300
        [appearance:textfield]
        [&::-webkit-inner-spin-button]:appearance-none
        [&::-webkit-outer-spin-button]:appearance-none
      "
                />
              </div>

              {/* Slider */}
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={years}
                onChange={(e) =>
                  setYears(Number(e.target.value))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-900"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>5</span>
                <span>30</span>
              </div>

              <div className="pt-2 mt-3 border-t border-gray-200">
                <p className="text-xs text-gray-600">
                  Mensualité totale
                </p>
                <p className="text-2xl text-blue-900 font-bold">
                  {totalMonthly.toLocaleString("fr-FR", {
                    maximumFractionDigits: 0,
                  })}{" "}
                  €
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* COLONNE 3 - Rendement & Notaire */}
        <div className="space-y-4">
          {/* Frais de Notaire */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h4 className="text-base text-gray-900 font-medium mb-3">
              Frais de Notaires
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">
                  Taux
                </p>
                <p className="text-2xl text-blue-900 font-bold">
                  7,40%
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">
                  Montant
                </p>
                <p className="text-2xl text-blue-900 font-bold">
                  177 600 €
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Prix d'achat
                </span>
                <span className="text-gray-900 font-medium">
                  2 400 000 €
                </span>
              </div>
              <div className="flex justify-between text-sm font-semibold mt-1">
                <span className="text-gray-900">
                  Total avec frais
                </span>
                <span className="text-blue-900">
                  2 577 600 €
                </span>
              </div>
            </div>
          </div>

          {/* Calculatrice avec Travaux */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Home className="w-5 h-5 text-blue-900" />
              <h4 className="text-base text-gray-900 font-medium">
                Avec Travaux/Apport
              </h4>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Prix bien
                </span>
                <input
                  type="number"
                  defaultValue="1100000"
                  className="w-28 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Travaux estimés
                </span>
                <input
                  type="number"
                  defaultValue="150000"
                  className="w-28 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Apport personnel
                </span>
                <input
                  type="number"
                  defaultValue="250000"
                  className="w-28 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                />
              </div>
              <div className="pt-2 mt-3 border-t border-gray-200">
                <p className="text-xs text-gray-600">
                  À financer
                </p>
                <p className="text-2xl text-blue-900 font-bold">
                  1 000 000 €
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}