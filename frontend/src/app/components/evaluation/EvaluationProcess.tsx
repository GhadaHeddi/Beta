import { useState } from "react";
import { Header } from "@/app/components/Header";
import { EvaluationTabs } from "@/app/components/evaluation/EvaluationTabs";
import { InformationsStep } from "@/app/components/evaluation/InformationsStep";
import { ComparisonStep } from "@/app/components/evaluation/ComparisonStep";
import { AnalysisStep } from "@/app/components/evaluation/AnalysisStep";
import { SimulationStep } from "@/app/components/evaluation/SimulationStep";
import { FinalisationStep } from "@/app/components/evaluation/FinalisationStep";
import { DocumentViewer } from "@/app/components/evaluation/DocumentViewer";
import { AIAssistant } from "@/app/components/evaluation/AIAssistant";

interface Document {
  id: string;
  name: string;
  size: string;
  date: string;
  icon: string;
}

interface DocumentTab {
  id: string;
  name: string;
  icon: string;
}

interface EvaluationProcessProps {
  projectTitle: string;
  projectAddress: string;
  propertyType: string;
  onBack?: () => void;
}

export function EvaluationProcess({
  projectTitle,
  projectAddress,
  propertyType,
  onBack,
}: EvaluationProcessProps) {
  const [activeTab, setActiveTab] =
    useState<string>("informations");
  const [documentTabs, setDocumentTabs] = useState<
    DocumentTab[]
  >([]);

  const handleOpenDocument = (doc: Document) => {
    // Vérifier si le document est déjà ouvert
    const exists = documentTabs.find(
      (tab) => tab.id === `doc-${doc.id}`,
    );
    if (exists) {
      setActiveTab(`doc-${doc.id}`);
      return;
    }

    // Limiter à 3 onglets de documents
    if (documentTabs.length >= 3) {
      alert(
        "Maximum 3 documents peuvent être ouverts simultanément",
      );
      return;
    }

    // Ajouter le nouvel onglet
    const newTab: DocumentTab = {
      id: `doc-${doc.id}`,
      name: doc.name,
      icon: doc.icon,
    };
    setDocumentTabs([...documentTabs, newTab]);
    setActiveTab(`doc-${doc.id}`);
  };

  const handleCloseDocumentTab = (tabId: string) => {
    setDocumentTabs(
      documentTabs.filter((tab) => tab.id !== tabId),
    );
    // Si l'onglet fermé était actif, retourner à Informations
    if (activeTab === tabId) {
      setActiveTab("informations");
    }
  };

  const renderStep = () => {
    // Vérifier si c'est un onglet de document
    if (activeTab.startsWith("doc-")) {
      const docTab = documentTabs.find(
        (tab) => tab.id === activeTab,
      );
      if (docTab) {
        return (
          <DocumentViewer
            documentName={docTab.name}
            documentIcon={docTab.icon}
          />
        );
      }
    }

    // Onglets standards
    switch (activeTab) {
      case "informations":
        return (
          <InformationsStep
            initialTitle={projectTitle}
            initialAddress={projectAddress}
            initialPropertyType={propertyType}
            onOpenDocument={handleOpenDocument}
          />
        );
      case "comparison":
        return <ComparisonStep />;
      case "Analysis":
        return <AnalysisStep />;
      case "Simulation":
        return <SimulationStep />;
      case "finalisation":
        return <FinalisationStep />;
      default:
        return (
          <InformationsStep
            initialTitle={projectTitle}
            initialAddress={projectAddress}
            initialPropertyType={propertyType}
            onOpenDocument={handleOpenDocument}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* En-tête fixe */}
      <div className="sticky top-0 z-50">
        <Header />
      </div>

      {/* Barre d'onglets avec barre de progression intégrée */}
      <div className="sticky top-24 z-40 bg-gray-50">
        <EvaluationTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          projectTitle={projectTitle}
          projectAddress={projectAddress}
          documentTabs={documentTabs}
          onCloseDocumentTab={handleCloseDocumentTab}
        />
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Zone de contenu (75%) */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7.5xl mx-auto px-8 py-6">
            {renderStep()}
          </div>
        </div>

        {/* Assistant IA (25%) */}
        <div className="w-[25%] flex-shrink-0">
          <AIAssistant />
        </div>
      </div>
    </div>
  );
}