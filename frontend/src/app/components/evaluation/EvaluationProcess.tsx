import { useState, useEffect } from "react";
import { Header } from "@/app/components/Header";
import { EvaluationTabs } from "@/app/components/evaluation/EvaluationTabs";
import { InformationsStep } from "@/app/components/evaluation/InformationsStep";
import { ComparisonStep } from "@/app/components/evaluation/ComparisonStep";
import { AnalysisStep } from "@/app/components/evaluation/AnalysisStep";
import { SimulationStep } from "@/app/components/evaluation/SimulationStep";
import { FinalisationStep } from "@/app/components/evaluation/FinalisationStep";
import { DocumentViewer } from "@/app/components/evaluation/DocumentViewer";
import { AIAssistant } from "@/app/components/evaluation/AIAssistant";
import { getPropertyInfo, getProjectFiles, getFileUrl } from "@/services/projectService";

interface Document {
  id: string;
  serverId?: number;
  name: string;
  size: string;
  date: string;
  icon: string;
  url?: string;
  mimeType?: string;
}

interface DocumentTab {
  id: string;
  name: string;
  icon: string;
  url?: string;
  mimeType?: string;
}

const stepToTab: Record<number, string> = {
  1: "informations",
  2: "comparison",
  3: "analysis",
  4: "simulation",
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

  const [documentTabs, setDocumentTabs] = useState<DocumentTab[]>([]);

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

  const [informationsDocuments, setInformationsDocuments] = useState<Document[]>(
    []
  );

  const [isAddressValidated, setIsAddressValidated] = useState(false);

  const [savedLatitude, setSavedLatitude] = useState<number | null>(null);
  const [savedLongitude, setSavedLongitude] = useState<number | null>(null);

  // Charger les donnees sauvegardees au montage
  useEffect(() => {
    async function loadSavedData() {
      try {
        // Charger les informations du bien
        const propertyInfo = await getPropertyInfo(projectId);
        if (propertyInfo) {
          setInformationsFormData((prev) => ({
            ...prev,
            ownerName: propertyInfo.owner_name || "",
            occupantName: propertyInfo.occupant_name || "",
            year: propertyInfo.construction_year ? String(propertyInfo.construction_year) : "",
            materials: propertyInfo.materials || "",
            geographicSector: propertyInfo.geographic_sector || "",
          }));

          setInformationsSwot({
            strengths: propertyInfo.swot_strengths || "",
            weaknesses: propertyInfo.swot_weaknesses || "",
            opportunities: propertyInfo.swot_opportunities || "",
            threats: propertyInfo.swot_threats || "",
          });

          setInformationsNotes(propertyInfo.notes || "");

          if (propertyInfo.latitude && propertyInfo.longitude) {
            setSavedLatitude(propertyInfo.latitude);
            setSavedLongitude(propertyInfo.longitude);
            setIsAddressValidated(true);
          }
        }

        // Charger les documents
        const files = await getProjectFiles(projectId);
        if (files.length > 0) {
          const docs: Document[] = files.map((f) => ({
            id: String(f.id),
            serverId: f.id,
            name: f.name,
            size: formatFileSize(f.size),
            date: new Date(f.uploaded_at).toLocaleDateString("fr-FR"),
            icon: f.mime_type?.startsWith("image/") ? "\uD83D\uDDBC\uFE0F" : "\uD83D\uDCC4",
            url: getFileUrl(projectId, f.id),
            mimeType: f.mime_type,
          }));
          setInformationsDocuments(docs);
        }
      } catch (error) {
        console.error("Erreur chargement donnees:", error);
      }
    }

    loadSavedData();
  }, [projectId]);

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }

  const handleCoordinatesChange = (lat: number, lng: number) => {
    setSavedLatitude(lat);
    setSavedLongitude(lng);
  };

  const [stepsCompletion, setStepsCompletion] = useState<Record<string, boolean>>(
    {
      informations: false,
      comparison: false,
      analysis: false,
      simulation: false,
      finalisation: false,
    }
  );

  const handleOpenDocument = (doc: Document) => {
    const tabId = `doc-${doc.id}`;

    const exists = documentTabs.find((tab) => tab.id === tabId);
    if (exists) {
      setActiveTab(tabId);
      return;
    }

    if (documentTabs.length >= 3) {
      alert("Maximum 3 documents peuvent être ouverts simultanément");
      return;
    }

    const newTab: DocumentTab = {
      id: tabId,
      name: doc.name,
      icon: doc.icon,
      url: doc.url,
      mimeType: doc.mimeType,
    };

    setDocumentTabs((prev) => [...prev, newTab]);
    setActiveTab(tabId);
  };

  const handleCloseDocumentTab = (tabId: string) => {
    setDocumentTabs((prev) => prev.filter((tab) => tab.id !== tabId));

    if (activeTab === tabId) {
      setActiveTab("informations");
    }
  };

  const renderStep = () => {
    // Onglet document dynamique
    if (activeTab.startsWith("doc-")) {
      const docTab = documentTabs.find((tab) => tab.id === activeTab);

      if (docTab) {
        return (
          <DocumentViewer
            documentName={docTab.name}
            documentIcon={docTab.icon}
            documentUrl={docTab.url}
            documentMimeType={docTab.mimeType}
          />
        );
      }
    }

    switch (activeTab) {
      case "informations":
        return (
          <InformationsStep
            projectId={projectId}
            formData={informationsFormData}
            notes={informationsNotes}
            swotAnalysis={informationsSwot}
            documents={informationsDocuments}
            isAddressValidated={isAddressValidated}
            onAddressValidatedChange={setIsAddressValidated}
            onFormDataChange={setInformationsFormData}
            onNotesChange={setInformationsNotes}
            onSwotChange={setInformationsSwot}
            onDocumentsChange={setInformationsDocuments}
            onStepComplete={() =>
              setStepsCompletion((prev) => ({ ...prev, informations: true }))
            }
            onOpenDocument={handleOpenDocument}
            onCoordinatesChange={handleCoordinatesChange}
            initialCoordinates={
              savedLatitude && savedLongitude
                ? { lat: savedLatitude, lng: savedLongitude }
                : undefined
            }
          />
        );

      case "comparison":
        return (
          <ComparisonStep
            projectId={projectId}
            evaluatedProperty={{
              address: projectAddress,
              surface: null,
              construction_year: informationsFormData.year ? parseInt(informationsFormData.year) : null,
              latitude: savedLatitude,
              longitude: savedLongitude,
              property_type: propertyType,
            }}
            onStepComplete={() => setStepsCompletion(prev => ({ ...prev, comparison: true }))}
          />
        );
      case "Analysis":
        return <AnalysisStep />;

      case "simulation":
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
            isAddressValidated={isAddressValidated}
            onAddressValidatedChange={setIsAddressValidated}
            onFormDataChange={setInformationsFormData}
            onNotesChange={setInformationsNotes}
            onSwotChange={setInformationsSwot}
            onDocumentsChange={setInformationsDocuments}
            onStepComplete={() =>
              setStepsCompletion((prev) => ({ ...prev, informations: true }))
            }
            onOpenDocument={handleOpenDocument}
            onCoordinatesChange={handleCoordinatesChange}
            initialCoordinates={
              savedLatitude && savedLongitude
                ? { lat: savedLatitude, lng: savedLongitude }
                : undefined
            }
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50">
        <Header onLogoClick={onBack} onDashboardClick={onDashboardClick} />
      </div>

      {/* Tabs + progress */}
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

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="max-w-7.5xl mx-auto px-8 py-6">{renderStep()}</div>
        </div>

        <div className="w-[25%] flex-shrink-0">
          <AIAssistant />
        </div>
      </div>
    </div>
  );
}
