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

// Mapping des numéros d'étape vers les identifiants d'onglets
const stepToTab: Record<number, string> = {
  1: "informations",
  2: "comparison",
  3: "Analysis",
  4: "Simulation",
  5: "finalisation",
};

interface FormData {
  title: string;
  address: string;
  ownerName: string;
  occupantName: string;
  propertyType: string;
  year: string;
  materials: string;
  geographicSector: string;
}

interface SwotAnalysis {
  strengths: string;
  weaknesses: string;
  opportunities: string;
  threats: string;
}

interface EvaluationProcessProps {
  projectId: number;
  projectTitle: string;
  projectAddress: string;
  propertyType: string;
  initialStep?: number;
  onBack?: () => void;
  onDashboardClick?: () => void;
}

export function EvaluationProcess({
  projectId,
  projectTitle,
  projectAddress,
  propertyType,
  initialStep = 1,
  onBack,
  onDashboardClick,
}: EvaluationProcessProps) {
  const [activeTab, setActiveTab] = useState<string>(
    stepToTab[initialStep] || "informations"
  );
  const [documentTabs, setDocumentTabs] = useState<
    DocumentTab[]
  >([]);

  // État des données du formulaire Informations (persisté lors de la navigation)
  const [informationsFormData, setInformationsFormData] = useState<FormData>({
    title: projectTitle,
    address: projectAddress,
    ownerName: "",
    occupantName: "",
    propertyType: propertyType,
    year: "",
    materials: "",
    geographicSector: "",
  });
  const [informationsNotes, setInformationsNotes] = useState("");
  const [informationsSwot, setInformationsSwot] = useState<SwotAnalysis>({
    strengths: "",
    weaknesses: "",
    opportunities: "",
    threats: "",
  });
  const [informationsDocuments, setInformationsDocuments] = useState<Document[]>([]);

  // Suivi de la complétion des étapes (✓ affiché uniquement si sauvegardé)
  const [stepsCompletion, setStepsCompletion] = useState<Record<string, boolean>>({
    informations: false,
    comparison: false,
    Analysis: false,
    Simulation: false,
    finalisation: false,
  });

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
            projectId={projectId}
            formData={informationsFormData}
            notes={informationsNotes}
            swotAnalysis={informationsSwot}
            documents={informationsDocuments}
            onFormDataChange={setInformationsFormData}
            onNotesChange={setInformationsNotes}
            onSwotChange={setInformationsSwot}
            onDocumentsChange={setInformationsDocuments}
            onStepComplete={() => setStepsCompletion(prev => ({ ...prev, informations: true }))}
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
            projectId={projectId}
            formData={informationsFormData}
            notes={informationsNotes}
            swotAnalysis={informationsSwot}
            documents={informationsDocuments}
            onFormDataChange={setInformationsFormData}
            onNotesChange={setInformationsNotes}
            onSwotChange={setInformationsSwot}
            onDocumentsChange={setInformationsDocuments}
            onStepComplete={() => setStepsCompletion(prev => ({ ...prev, informations: true }))}
            onOpenDocument={handleOpenDocument}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* En-tête fixe */}
      <div className="sticky top-0 z-50">
        <Header onLogoClick={onBack} onDashboardClick={onDashboardClick} />
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
          stepsCompletion={stepsCompletion}
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
