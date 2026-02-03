import { useState } from "react";
import { Header } from "@/app/components/Header";
import { ProjectCreation } from "@/app/components/ProjectCreation";
import { RecentProjects } from "@/app/components/RecentProjects";
import { OffersPanel } from "@/app/components/OffersPanel";
import { EvaluationProcess } from "@/app/components/evaluation/EvaluationProcess";
import { Dashboard } from "@/app/components/Dashboard";
import { MarketTrends } from "@/app/components/MarketTrends";

export default function App() {
  const [view, setView] = useState<"home" | "evaluation" | "dashboard" | "market-trends">("home");
  const [currentProject, setCurrentProject] = useState<{ title: string; address: string; propertyType: string } | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const handleStartEvaluation = (title: string, address: string, propertyType: string) => {
    setCurrentProject({ title, address, propertyType });
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

  if (view === "evaluation" && currentProject) {
    return <EvaluationProcess 
      projectTitle={currentProject.title} 
      projectAddress={currentProject.address}
      propertyType={currentProject.propertyType}
      onBack={handleBackToHome}
    />;
  }

  if (view === "dashboard") {
    return (
      <>
        <Header onLogoClick={handleBackToHome} onDashboardClick={handleCloseDashboard} />
        <Dashboard onBack={handleCloseDashboard} />
      </>
    );
  }

  if (view === "market-trends" && selectedCity) {
    return <MarketTrends city={selectedCity} onBack={handleBackToHome} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onLogoClick={handleBackToHome} onDashboardClick={handleOpenDashboard} />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Zone principale (78%) */}
        <div className="flex-1 flex flex-col overflow-auto" style={{ width: '78%' }}>
          <div className="h-[40vh]">
            <ProjectCreation onStartEvaluation={handleStartEvaluation} />
          </div>
          
          <div className="flex-1 overflow-auto">
            <RecentProjects />
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