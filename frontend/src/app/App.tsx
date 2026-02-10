import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/app/components/Header";
import { ProjectCreation } from "@/app/components/ProjectCreation";
import { RecentProjects } from "@/app/components/RecentProjects";
import { OffersPanel } from "@/app/components/OffersPanel";
import { EvaluationProcess } from "@/app/components/evaluation/EvaluationProcess";
import { Dashboard } from "@/app/components/Dashboard";
import { MarketTrends } from "@/app/components/MarketTrends";
import { SearchResultsPage } from "@/app/components/SearchResultsPage";
import { TrashPage } from "@/app/components/TrashPage";
import { LoginModal } from "@/app/components/LoginModal";
import { Loader2 } from "lucide-react";
import type { Project } from "@/types/project";

interface CurrentProject {
  id: number;
  title: string;
  address: string;
  propertyType: string;
  currentStep: number;
}

export default function App() {
  const { isAuthenticated, isAuthLoading, login } = useAuth();
  const [view, setView] = useState<"home" | "evaluation" | "dashboard" | "market-trends" | "search-results"| "trash">("home");
  const [currentProject, setCurrentProject] = useState<CurrentProject | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = async (email: string, password: string) => {
    setLoginError(null);
    const error = await login(email, password);
    if (error) {
      setLoginError(error);
    }
  };

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

  // Loading state while verifying auth token
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-gray-500">
          <Loader2 className="w-10 h-10 animate-spin text-red-700" />
          <span className="text-lg">Chargement...</span>
        </div>
      </div>
    );
  }

  // Not authenticated — show login
  if (!isAuthenticated) {
    return <LoginModal isOpen={true} onLogin={handleLogin} error={loginError} />;
  }

  // Authenticated — render views with transitions
  return (
    <div key={view} className="page-transition">
      {view === "trash" && (
        <>
          <Header onLogoClick={handleBackToHome} onDashboardClick={handleOpenDashboard} onTrashClick={handleOpenTrash} />
          <TrashPage onBack={handleBackToHome} isAdmin={false} />
        </>
      )}

      {view === "evaluation" && currentProject && (
        <EvaluationProcess
          projectId={currentProject.id}
          projectTitle={currentProject.title}
          projectAddress={currentProject.address}
          propertyType={currentProject.propertyType}
          initialStep={currentProject.currentStep}
          onBack={handleBackToHome}
          onDashboardClick={handleOpenDashboard}
        />
      )}

      {view === "dashboard" && (
        <>
          <Header onLogoClick={handleBackToHome} onDashboardClick={handleCloseDashboard} onTrashClick={handleOpenTrash} />
          <Dashboard onBack={handleCloseDashboard} />
        </>
      )}

      {view === "market-trends" && selectedCity && (
        <MarketTrends city={selectedCity} onBack={handleBackToHome} onDashboardClick={handleOpenDashboard} />
      )}

      {view === "search-results" && (
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
      )}

      {view === "home" && (
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header
            onLogoClick={handleBackToHome}
            onDashboardClick={handleOpenDashboard}
            onTrashClick={handleOpenTrash}
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
        </div>
      )}
    </div>
  );
}
