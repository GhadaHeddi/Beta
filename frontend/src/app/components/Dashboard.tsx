import { useState, useEffect, useCallback } from "react";
import { Filter, User, Clock, CheckCircle2, AlertCircle, FileText, ArrowLeft, Loader2 } from "lucide-react";
import { AgencySelector } from "@/app/components/AgencySelector";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE_URL = "http://localhost:8000/api";

interface DashboardData {
  consultants_count: number;
  projects_count: number;
  projects_by_status: Record<string, number>;
  recent_projects: Array<{
    id: number;
    title: string;
    address: string;
    status: string | null;
    owner_id: number;
    agency_id?: number | null;
    created_at: string | null;
  }>;
}

interface DashboardProps {
  onBack: () => void;
}

export function Dashboard({ onBack }: DashboardProps) {
  const { accessToken, currentUser } = useAuth();
  const [selectedAgencyId, setSelectedAgencyId] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedAgencyId != null) {
        params.append("agency_id", String(selectedAgencyId));
      }
      const queryString = params.toString();
      const url = `${API_BASE_URL}/admin/dashboard${queryString ? `?${queryString}` : ""}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`Erreur serveur (${response.status})`);
      const data: DashboardData = await response.json();
      setDashboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, [accessToken, selectedAgencyId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "in_progress":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "archived":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4" />;
      case "in_progress":
        return <Clock className="w-4 h-4" />;
      case "draft":
        return <AlertCircle className="w-4 h-4" />;
      case "archived":
        return <FileText className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Termine";
      case "in_progress":
        return "En cours";
      case "draft":
        return "Brouillon";
      case "archived":
        return "Archive";
      default:
        return status;
    }
  };

  const stats = dashboardData
    ? {
        total: dashboardData.projects_count,
        completed: dashboardData.projects_by_status["completed"] || 0,
        inProgress: dashboardData.projects_by_status["in_progress"] || 0,
        draft: dashboardData.projects_by_status["draft"] || 0,
        archived: dashboardData.projects_by_status["archived"] || 0,
      }
    : { total: 0, completed: 0, inProgress: 0, draft: 0, archived: 0 };

  // Filtrer les projets recents par statut
  const filteredProjects = (dashboardData?.recent_projects || []).filter((p) => {
    if (selectedStatus === "all") return true;
    return p.status === selectedStatus;
  });

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
                <h1 className="text-3xl text-blue-900">Dashboard Equipe</h1>
                <p className="text-gray-600 mt-1">Vue d'ensemble de l'avancement des avis de valeur</p>
              </div>
            </div>
            {/* Selecteur d'agence */}
            {currentUser?.role === "admin" && (
              <AgencySelector
                selectedAgencyId={selectedAgencyId}
                onAgencyChange={setSelectedAgencyId}
              />
            )}
          </div>

          {/* Stats Cards */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : (
            <>
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
                      <p className="text-sm text-green-600">Termines</p>
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

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Brouillons</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.draft}</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-gray-600" />
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600">Consultants</p>
                      <p className="text-2xl font-semibold text-purple-900">{dashboardData?.consultants_count || 0}</p>
                    </div>
                    <User className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Filtres */}
              <div className="flex items-center gap-4">
                <Filter className="w-5 h-5 text-gray-500" />
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Statut:</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="draft">Brouillon</option>
                    <option value="in_progress">En cours</option>
                    <option value="completed">Termine</option>
                    <option value="archived">Archive</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content - Projets recents */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        {!loading && !error && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Projets recents</h2>
            {filteredProjects.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <p className="text-gray-500">Aucun projet ne correspond aux filtres selectionnes</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {filteredProjects.map((project) => (
                    <div key={project.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{project.title}</h4>
                            {project.status && (
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                                {getStatusIcon(project.status)}
                                {getStatusLabel(project.status)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{project.address}</p>
                          {project.created_at && (
                            <p className="text-xs text-gray-400 mt-1">
                              Cree le {new Date(project.created_at).toLocaleDateString("fr-FR")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
