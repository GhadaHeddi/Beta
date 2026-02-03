import { X } from "lucide-react";
import { ProgressBar } from "@/app/components/evaluation/ProgressBar";

interface Tab {
  id: string;
  label: string;
  disabled?: boolean;
}

interface DocumentTab {
  id: string;
  name: string;
  icon: string;
}

interface EvaluationTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  projectTitle: string;
  projectAddress: string;
  documentTabs?: DocumentTab[];
  onCloseDocumentTab?: (tabId: string) => void;
}

export function EvaluationTabs({
  activeTab,
  onTabChange,
  projectTitle,
  projectAddress,
  documentTabs = [],
  onCloseDocumentTab,
}: EvaluationTabsProps) {
  const tabs: Tab[] = [
    { id: "informations", label: "Informations" },
    { id: "comparison", label: "Comparaison" },
    { id: "Analysis", label: "Analysis" },
    { id: "Simulation", label: "Simulation" },
    {
      id: "finalisation",
      label: "Finalisation",
      disabled: activeTab === "informations",
    },
  ];

  return (
    <div className="sticky top-24 bg-white border-b border-gray-200">
      <div className="flex items-stretch">
        {/* Titre sur fond rouge à gauche */}
        <div className="bg-red-700 px-8 py-5 flex flex-col justify-center min-w-[320px]">
          <h1 className="text-2xl text-white font-bold leading-tight">
            {projectTitle}
          </h1>
          <p className="text-sm text-red-100 mt-1.5">
            {projectAddress}
          </p>
        </div>

        <div className="flex flex-col w-full h-full">
          {/* ================== HAUT : barre de progression ================== */}
          <div className="w-full shrink-0">
            <ProgressBar activeTab={activeTab} />
          </div>

          {/* ================== BAS : onglets ================== */}
          <div className="flex-1 overflow-x-auto">
            <div className="flex items-center gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() =>
                    !tab.disabled && onTabChange(tab.id)
                  }
                  disabled={tab.disabled}
                  className={`
            px-10 py-5 text-base transition-all relative
            ${
              activeTab === tab.id
                ? "text-red-700 font-semibold"
                : tab.disabled
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-50"
            }
          `}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-700" />
                  )}
                </button>
              ))}

              {/* Onglets de documents dynamiques */}
              {documentTabs.map((docTab) => (
                <button
                  key={docTab.id}
                  onClick={() => onTabChange(docTab.id)}
                  className={`
            px-6 py-5 text-base transition-all relative flex items-center gap-2 group
            ${
              activeTab === docTab.id
                ? "text-red-700 font-semibold"
                : "text-gray-600 hover:bg-gray-50"
            }
          `}
                >
                  <span>{docTab.icon}</span>
                  <span>{docTab.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseDocumentTab?.(docTab.id);
                    }}
                    className="ml-1 p-0.5 hover:bg-gray-200 rounded transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {activeTab === docTab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-700" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}