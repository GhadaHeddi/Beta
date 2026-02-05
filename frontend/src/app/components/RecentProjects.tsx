import {
  Edit2,
  Share2,
  Building2,
  Factory,
  Store,
  TreePine,
  Filter,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { useRecentProjects } from "@/hooks/useProjects";
import type { Project, ProjectStatus, PropertyType } from "@/types/project";

// Mapping des types de propriété backend vers l'affichage
const propertyTypeConfig: Record<PropertyType, { icon: typeof Building2; label: string; emoji: string }> = {
  office: { icon: Building2, label: "Bureaux", emoji: "\u{1F3E2}" },
  warehouse: { icon: Factory, label: "Entrepot", emoji: "\u{1F3ED}" },
  retail: { icon: Store, label: "Commerce", emoji: "\u{1F3EA}" },
  industrial: { icon: Factory, label: "Locaux d'activite", emoji: "\u{1F3ED}" },
  land: { icon: TreePine, label: "Terrain", emoji: "\u{1F333}" },
  mixed: { icon: Building2, label: "Mixte", emoji: "\u{1F3D7}" },
};

// Mapping des statuts backend vers l'affichage
const statusConfig: Record<ProjectStatus, { label: string; color: string }> = {
  draft: { label: "Brouillon", color: "bg-gray-100 text-gray-800" },
  in_progress: { label: "En cours", color: "bg-blue-100 text-blue-800" },
  completed: { label: "Termine", color: "bg-green-100 text-green-800" },
  archived: { label: "Archive", color: "bg-gray-100 text-gray-800" },
};

// Calculer la progression en pourcentage (5 etapes max)
function calculateProgress(currentStep: number): number {
  return Math.round((currentStep / 5) * 100);
}

// Obtenir la couleur du badge de statut en fonction de la progression
function getProgressColor(progress: number): string {
  if (progress === 100) return "bg-green-100 text-green-800";
  if (progress === 0) return "bg-gray-100 text-gray-800";
  return "bg-blue-100 text-blue-800";
}

interface RecentProjectsProps {
  onProjectClick?: (project: Project) => void;
}

export function RecentProjects({ onProjectClick }: RecentProjectsProps) {
  const { projects, loading, error, refetch } = useRecentProjects();
  const [progressFilter, setProgressFilter] = useState<"all" | "0-50" | "50-75" | "75-99" | "completed">("all");

  // Filtrer les projets en fonction du filtre de progression
  const filteredProjects = projects.filter((project) => {
    const progress = calculateProgress(project.current_step);
    if (progressFilter === "all") return true;
    if (progressFilter === "0-50") return progress >= 0 && progress <= 50;
    if (progressFilter === "50-75") return progress > 50 && progress <= 75;
    if (progressFilter === "75-99") return progress > 75 && progress < 100;
    if (progressFilter === "completed") return progress === 100;
    return true;
  });

  // Calculer le taux de completion moyen
  const averageCompletion = projects.length > 0
    ? Math.round(projects.reduce((acc, p) => acc + calculateProgress(p.current_step), 0) / projects.length)
    : 0;

  const completionStatus = averageCompletion === 100 ? "completed" : averageCompletion === 0 ? "draft" : "in_progress";

  // Affichage du chargement (skeleton)
  if (loading) {
    return (
      <div className="bg-white px-8 py-8">
        <div className="w-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl text-blue-900">
              Mes avis de valeur recents
            </h2>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 h-[50vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span>Chargement des projets...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Affichage de l'erreur
  if (error) {
    return (
      <div className="bg-white px-8 py-8">
        <div className="w-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl text-blue-900">
              Mes avis de valeur recents
            </h2>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 h-[50vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-red-600">
              <AlertCircle className="w-8 h-8" />
              <span>{error}</span>
              <button
                onClick={refetch}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white px-8 py-8">
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl text-blue-900">
            Mes avis de valeur recents
          </h2>

          <div className="flex items-center gap-4">
            {/* Filtres de progression */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <button
                onClick={() => setProgressFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  progressFilter === "all"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setProgressFilter("0-50")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  progressFilter === "0-50"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                0-50%
              </button>
              <button
                onClick={() => setProgressFilter("50-75")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  progressFilter === "50-75"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                50-75%
              </button>
              <button
                onClick={() => setProgressFilter("75-99")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  progressFilter === "75-99"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                75-99%
              </button>
              <button
                onClick={() => setProgressFilter("completed")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  progressFilter === "completed"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Termines
              </button>
            </div>

            {/* Badge de completion totale */}
            <span
              className={`inline-block px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                statusConfig[completionStatus].color
              }`}
            >
              Completion totale : {averageCompletion}%
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 h-[50vh] overflow-y-auto">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10 bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="text-center px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                    Responsable du projet
                  </th>
                  <th className="text-center px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                    Statut
                  </th>
                  <th className="text-center px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                    Titre
                  </th>
                  <th className="text-center px-10 py-4 text-sm text-gray-700 whitespace-nowrap">
                    Adresse
                  </th>
                  <th className="text-center px-8 py-4 text-sm text-gray-700 whitespace-nowrap">
                    Occupant actuel
                  </th>
                  <th className="text-center px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                    Surface (m2)
                  </th>
                  <th className="text-center px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                    Loyer de marche <br />
                    (EUR/m2/an)
                  </th>
                  <th className="text-center px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                    Prix vente estime <br />
                    (EUR/m2)
                  </th>
                  <th className="text-center px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                    Annee <br />
                    de construction
                  </th>
                  <th className="text-center px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                      Aucun projet trouve
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((project, index) => {
                    const typeConfig = propertyTypeConfig[project.property_type];
                    const progress = calculateProgress(project.current_step);
                    const progressColor = getProgressColor(progress);

                    const handleRowClick = () => {
                      if (onProjectClick) {
                        onProjectClick(project);
                      }
                    };

                    return (
                      <tr
                        key={project.id}
                        onClick={handleRowClick}
                        className={`border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors ${
                          index % 2 === 1
                            ? "bg-gray-50"
                            : "bg-white"
                        }`}
                      >
                        <td className="px-6 py-4 text-blue-900 whitespace-nowrap">
                          {project.user.first_name} {project.user.last_name}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm whitespace-nowrap ${progressColor}`}
                          >
                            {progress}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-gray-700">
                            <span className="text-lg">
                              {typeConfig.emoji}
                            </span>
                            <span>{project.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {project.address}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {project.property_info?.occupant_name || "-"}
                        </td>
                        <td className="px-6 py-4 text-gray-700 text-center whitespace-nowrap">
                          {project.property_info?.total_surface ?? "-"}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-700 whitespace-nowrap">
                          <span className="text-gray-400">-</span>
                        </td>
                        <td className="px-6 py-4 text-right text-blue-900 font-semibold whitespace-nowrap">
                          <span className="text-gray-400 font-normal">-</span>
                        </td>
                        <td className="px-6 text-center py-4 text-gray-700 whitespace-nowrap">
                          {project.property_info?.construction_year ?? "-"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowClick();
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Modifier le projet"
                            >
                              <Edit2 className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Partager le projet"
                            >
                              <Share2 className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
