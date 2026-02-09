import { useState } from "react";
import { Header } from "@/app/components/Header";
import { ProjectCreation } from "@/app/components/ProjectCreation";
import { RecentProjects } from "@/app/components/RecentProjects";
import { OffersPanel } from "@/app/components/OffersPanel";
import { EvaluationProcess } from "@/app/components/evaluation/EvaluationProcess";
import { Dashboard } from "@/app/components/Dashboard";
import { MarketTrends } from "@/app/components/MarketTrends";
import { SearchResultsPage } from "@/app/components/SearchResultsPage";
import type { Project } from "@/types/project";

interface CurrentProject {
  id: number;
  title: string;
  address: string;
  propertyType: string;
  currentStep: number;
}

// Composant wrapper pour les transitions de page
function PageTransition({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`animate-fade-in ${className}`}>
      {children}
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<"home" | "evaluation" | "dashboard" | "market-trends" | "search-results">("home");
  const [currentProject, setCurrentProject] = useState<CurrentProject | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setView("search-results");
    }
  };
  const handleOpenTrash = () => {
    setView("trash");
  };

  if (view === "trash") {
    return (
      <PageTransition key="trash">
        <Header onLogoClick={handleBackToHome} onDashboardClick={handleOpenDashboard} onTrashClick={handleOpenTrash} />
        <TrashPage onBack={handleBackToHome} isAdmin={false} />
      </PageTransition>
    );
  }

  if (view === "evaluation" && currentProject) {
    return (
      <PageTransition key="evaluation">
        <EvaluationProcess
          projectId={currentProject.id}
          projectTitle={currentProject.title}
          projectAddress={currentProject.address}
          propertyType={currentProject.propertyType}
          initialStep={currentProject.currentStep}
          onBack={handleBackToHome}
          onDashboardClick={handleOpenDashboard}
        />
      </PageTransition>
    );
  }

  if (view === "dashboard") {
    return (
      <PageTransition key="dashboard">
        <Header onLogoClick={handleBackToHome} onDashboardClick={handleCloseDashboard} onTrashClick={handleOpenTrash} />
        <Dashboard onBack={handleCloseDashboard} />
      </PageTransition>
    );
  }

  if (view === "market-trends" && selectedCity) {
    return (
      <PageTransition key="market-trends">
        <MarketTrends city={selectedCity} onBack={handleBackToHome} onDashboardClick={handleOpenDashboard} />
      </PageTransition>
    );
  }

  if (view === "search-results") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header
          onLogoClick={handleBackToHome}
          onDashboardClick={handleOpenDashboard}
          searchQuery={searchQuery}
          onSearch={handleSearch}
        />
        <SearchResultsPage
          initialQuery={searchQuery}
          onProjectClick={handleOpenProject}
          onQueryChange={setSearchQuery}
        />
      </div>
    );
  }

  return (
    <PageTransition key="home" className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        onLogoClick={handleBackToHome}
        onDashboardClick={handleOpenDashboard}
        searchQuery={searchQuery}
        onSearch={handleSearch}
      />
      
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
    </PageTransition>
  );
}
