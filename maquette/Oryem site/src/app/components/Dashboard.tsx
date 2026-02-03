import { useState } from "react";
import { Filter, User, Clock, CheckCircle2, AlertCircle, FileText, ArrowLeft } from "lucide-react";

interface Project {
  id: string;
  title: string;
  address: string;
  consultant: string;
  progress: number;
  status: "not-started" | "in-progress" | "review" | "completed";
  currentStep: string;
  lastUpdate: string;
  propertyType: string;
}

interface DashboardProps {
  onBack: () => void;
}

export function Dashboard({ onBack }: DashboardProps) {
  const [selectedConsultant, setSelectedConsultant] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Mock data - dans une vraie application, ces données viendraient d'une API
  const projects: Project[] = [
    {
      id: "1",
      title: "Bureaux Charles de Gaulle",
      address: "15 Avenue Charles de Gaulle, 92200 Neuilly",
      consultant: "Michel François",
      progress: 100,
      status: "completed",
      currentStep: "Finalisé",
      lastUpdate: "Il y a 2h",
      propertyType: "Bureaux"
    },
    {
      id: "2",
      title: "Commerce Rivoli",
      address: "28 Rue de Rivoli, 75001 Paris",
      consultant: "Frank Denis",
      progress: 0,
      status: "not-started",
      currentStep: "Non démarré",
      lastUpdate: "Il y a 1j",
      propertyType: "Commerce"
    },
    {
      id: "3",
      title: "Entrepôt Montreuil",
      address: "42 Zone Industrielle Nord, 93100 Montreuil",
      consultant: "Michel François",
      progress: 65,
      status: "in-progress",
      currentStep: "Comparaison",
      lastUpdate: "Il y a 3h",
      propertyType: "Entrepôt"
    },
    {
      id: "4",
      title: "Terrain Haussmann",
      address: "5 Boulevard Haussmann, 75009 Paris",
      consultant: "Frank Denis",
      progress: 58,
      status: "in-progress",
      currentStep: "Comparaison",
      lastUpdate: "Il y a 5h",
      propertyType: "Terrain"
    },
    {
      id: "5",
      title: "Entrepôt Longjumeau",
      address: "12 Route Nationale 7, 91160 Longjumeau",
      consultant: "Hugo Despommés",
      progress: 78,
      status: "review",
      currentStep: "Synthèse",
      lastUpdate: "Il y a 1h",
      propertyType: "Entrepôt"
    },
    {
      id: "6",
      title: "Local Champs-Élysées",
      address: "33 Avenue des Champs-Élysées, 75008 Paris",
      consultant: "Michel François",
      progress: 15,
      status: "in-progress",
      currentStep: "Informations",
      lastUpdate: "Il y a 4h",
      propertyType: "Local commercial"
    },
    {
      id: "7",
      title: "Local commercial Saint-Denis",
      address: "150 Avenue du Président Wilson, 93200 Saint-Denis",
      consultant: "Frank Denis",
      progress: 48,
      status: "in-progress",
      currentStep: "Informations",
      lastUpdate: "Il y a 6h",
      propertyType: "Local commercial"
    },
    {
      id: "8",
      title: "Bureaux La Défense",
      address: "20 Esplanade de La Défense, 92400 Courbevoie",
      consultant: "Hugo Despommés",
      progress: 100,
      status: "completed",
      currentStep: "Finalisé",
      lastUpdate: "Il y a 1j",
      propertyType: "Bureaux"
    }
  ];

  const consultants = ["all", ...Array.from(new Set(projects.map(p => p.consultant)))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "review":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "in-progress":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "not-started":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4" />;
      case "review":
        return <Clock className="w-4 h-4" />;
      case "in-progress":
        return <FileText className="w-4 h-4" />;
      case "not-started":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Terminé";
      case "review":
        return "En révision";
      case "in-progress":
        return "En cours";
      case "not-started":
        return "Non démarré";
      default:
        return status;
    }
  };

  // Filtrer les projets
  const filteredProjects = projects.filter(project => {
    const matchesConsultant = selectedConsultant === "all" || project.consultant === selectedConsultant;
    const matchesStatus = selectedStatus === "all" || project.status === selectedStatus;
    return matchesConsultant && matchesStatus;
  });

  // Grouper par consultant
  const projectsByConsultant = filteredProjects.reduce((acc, project) => {
    if (!acc[project.consultant]) {
      acc[project.consultant] = [];
    }
    acc[project.consultant].push(project);
    return acc;
  }, {} as Record<string, Project[]>);

  // Statistiques
  const stats = {
    total: filteredProjects.length,
    completed: filteredProjects.filter(p => p.status === "completed").length,
    inProgress: filteredProjects.filter(p => p.status === "in-progress").length,
    notStarted: filteredProjects.filter(p => p.status === "not-started").length,
    review: filteredProjects.filter(p => p.status === "review").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl text-blue-900">Dashboard Équipe</h1>
                <p className="text-gray-600 mt-1">Vue d'ensemble de l'avancement des avis de valeur</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Total</p>
                  <p className="text-2xl font-semibold text-blue-900">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Terminés</p>
                  <p className="text-2xl font-semibold text-green-900">{stats.completed}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600">En cours</p>
                  <p className="text-2xl font-semibold text-orange-900">{stats.inProgress}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">En révision</p>
                  <p className="text-2xl font-semibold text-blue-900">{stats.review}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Non démarrés</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.notStarted}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-gray-600" />
              </div>
            </div>
          </div>

          {/* Filtres */}
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Consultant:</label>
              <select
                value={selectedConsultant}
                onChange={(e) => setSelectedConsultant(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les consultants</option>
                {consultants.filter(c => c !== "all").map(consultant => (
                  <option key={consultant} value={consultant}>{consultant}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Statut:</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="not-started">Non démarré</option>
                <option value="in-progress">En cours</option>
                <option value="review">En révision</option>
                <option value="completed">Terminé</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        {Object.entries(projectsByConsultant).length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500">Aucun projet ne correspond aux filtres sélectionnés</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(projectsByConsultant).map(([consultant, consultantProjects]) => (
              <div key={consultant} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* En-tête consultant */}
                <div className="bg-blue-50 border-b border-blue-200 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900">{consultant}</h3>
                      <p className="text-sm text-blue-700">{consultantProjects.length} projet{consultantProjects.length > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-blue-700">
                    <span>{consultantProjects.filter(p => p.status === "completed").length} terminé{consultantProjects.filter(p => p.status === "completed").length > 1 ? 's' : ''}</span>
                    <span>{consultantProjects.filter(p => p.status === "in-progress" || p.status === "review").length} en cours</span>
                  </div>
                </div>

                {/* Liste des projets */}
                <div className="divide-y divide-gray-200">
                  {consultantProjects.map(project => (
                    <div key={project.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{project.title}</h4>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                              {getStatusIcon(project.status)}
                              {getStatusLabel(project.status)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{project.address}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="inline-flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5" />
                              {project.propertyType}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {project.lastUpdate}
                            </span>
                            <span>Étape: {project.currentStep}</span>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="w-48">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">Progression</span>
                            <span className="text-xs font-semibold text-gray-900">{project.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full ${
                                project.progress === 100
                                  ? "bg-green-600"
                                  : project.progress >= 75
                                  ? "bg-blue-600"
                                  : project.progress >= 50
                                  ? "bg-orange-500"
                                  : project.progress > 0
                                  ? "bg-yellow-500"
                                  : "bg-gray-400"
                              }`}
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
