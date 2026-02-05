import { useState } from "react";
import { Header } from "@/app/components/Header";
import { ProjectCreation } from "@/app/components/ProjectCreation";
import { RecentProjects } from "@/app/components/RecentProjects";
import { OffersPanel } from "@/app/components/OffersPanel";
import { EvaluationProcess } from "@/app/components/evaluation/EvaluationProcess";
import { Dashboard } from "@/app/components/Dashboard";
import { MarketTrends } from "@/app/components/MarketTrends";
import { TrashPage } from "@/app/components/TrashPage";
import type { Project } from "@/types/project";

interface CurrentProject {
  id: number;
  title: string;
  address: string;
  propertyType: string;
  currentStep: number;
}

export default function App() {
  const [view, setView] = useState<"home" | "evaluation" | "dashboard" | "market-trends" | "trash">("home");
  const [currentProject, setCurrentProject] = useState<CurrentProject | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const handleStartEvaluation = (id: number, title: string, address: string, propertyType: string) => {
    setCurrentProject({ id, title, address, propertyType, currentStep: 1 });
    setView("evaluation");
  };

  const handleOpenProject = (project: Project) => {
    setCurrentProject({
      id: project.id,
      title: project.title,
      address: project.address,
      propertyType: project.property_type,
      currentStep: project.current_step,
    });
    setView("evaluation");
  };

  const handleBackToHome = () => {
    setView("home");
    setCurrentProject(null);
    setSelectedCity(null);
  };

  const handleOpenDashboard = () => {
    setView("dashboard");
  };

  const handleCloseDashboard = () => {
    setView("home");
  };

  const handleViewMarketTrends = (city: string) => {
    setSelectedCity(city);
    setView("market-trends");
  };

  const handleOpenTrash = () => {
    setView("trash");
  };

  if (view === "trash") {
    return (
      <>
        <Header onLogoClick={handleBackToHome} onDashboardClick={handleOpenDashboard} onTrashClick={handleOpenTrash} />
        <TrashPage onBack={handleBackToHome} isAdmin={false} />
      </>
    );
  }

  if (view === "evaluation" && currentProject) {
    return <EvaluationProcess
      projectId={currentProject.id}
      projectTitle={currentProject.title}
      projectAddress={currentProject.address}
      propertyType={currentProject.propertyType}
      initialStep={currentProject.currentStep}
      onBack={handleBackToHome}
      onDashboardClick={handleOpenDashboard}
    />;
  }

  if (view === "dashboard") {
    return (
      <>
        <Header onLogoClick={handleBackToHome} onDashboardClick={handleCloseDashboard} onTrashClick={handleOpenTrash} />
        <Dashboard onBack={handleCloseDashboard} />
      </>
    );
  }

  if (view === "market-trends" && selectedCity) {
    return <MarketTrends city={selectedCity} onBack={handleBackToHome} onDashboardClick={handleOpenDashboard} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onLogoClick={handleBackToHome} onDashboardClick={handleOpenDashboard} onTrashClick={handleOpenTrash} />

      <div className="flex-1 flex overflow-hidden">
        {/* Zone principale (78%) */}
        <div className="flex-1 flex flex-col overflow-auto" style={{ width: '78%' }}>
          <div className="h-[40vh]">
            <ProjectCreation onStartEvaluation={handleStartEvaluation} />
          </div>

          <div className="flex-1 overflow-auto">
            <RecentProjects onProjectClick={handleOpenProject} />
          </div>
        </div>

        {/* Panneau latéral droit (22%) */}
        <div className="w-[22%] flex-shrink-0">
          <OffersPanel onViewMarketTrends={handleViewMarketTrends} />
        </div>
      </div>
    </div>
  );
}
