import { CheckCircle2 } from "lucide-react";

interface ProgressBarProps {
  activeTab: string;
  stepsCompletion?: Record<string, boolean>;
}

interface Step {
  id: string;
  label: string;
  shortLabel: string;
  percentage: number;
}

export function ProgressBar({ activeTab, stepsCompletion }: ProgressBarProps) {
  const steps: Step[] = [
    {
      id: "informations",
      label: "Informations de l'immeuble",
      shortLabel: "Informations",
      percentage: 20,
    },
    {
      id: "comparison",
      label: "Comparaison",
      shortLabel: "Comparaison",
      percentage: 40,
    },
    {
      id: "analysis",
      label: "Analyse",
      shortLabel: "Analyse",
      percentage: 60,
    },
    {
      id: "simulation",
      label: "Simulation",
      shortLabel: "Simulation",
      percentage: 80,
    },
    {
      id: "finalisation",
      label: "Finalisation",
      shortLabel: "Finalisation",
      percentage: 100,
    },
  ];

  // Déterminer l'index de l'étape active
  const activeIndex = steps.findIndex(
    (step) => step.id === activeTab,
  );
  const currentStepIndex = activeIndex !== -1 ? activeIndex : 0;

  // Calculer le pourcentage de progression basé sur l'étape active
  const progressPercentage =
    ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="bg-white py-4 px-8">
      <div className="max-w-7xl mx-auto">
        {/* Barre de progression */}
        <div className="relative px-5">
          {/* Barre de fond */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full">
            {/* Barre de progression animée */}
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Étapes */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const isActive = index === currentStepIndex;
              // ✓ apparaît uniquement si l'étape a été sauvegardée (pas basé sur la position)
              const isCompleted = stepsCompletion?.[step.id] ?? false;

              return (
                <div
                  key={step.id}
                  className="flex flex-col items-center"
                  style={{ width: "25%" }}
                >
                  {/* Cercle de l'étape */}
                  <div
                    className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                      isCompleted
                        ? "bg-blue-600 border-blue-600"
                        : isActive
                          ? "bg-white border-blue-600 shadow-lg ring-4 ring-blue-100"
                          : "bg-white border-gray-300"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    ) : (
                      <div
                        className={`w-5 h-5 rounded-full transition-colors ${
                          isActive
                            ? "bg-blue-600"
                            : "bg-gray-300"
                        }`}
                      >
                        {isActive && (
                          <div className="w-full h-full rounded-full bg-blue-600 animate-pulse" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Label de l'étape */}
                  <div className="mt-2 text-center">
                    <p
                      className={`text-xs font-medium transition-colors hidden sm:block ${
                        isActive
                          ? "text-blue-900"
                          : isCompleted
                            ? "text-blue-700"
                            : "text-gray-500"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p
                      className={`text-xs font-medium transition-colors sm:hidden ${
                        isActive
                          ? "text-blue-900"
                          : isCompleted
                            ? "text-blue-700"
                            : "text-gray-500"
                      }`}
                    >
                      {step.shortLabel}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}