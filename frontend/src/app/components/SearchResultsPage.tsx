import { useEffect } from "react";
import {
  Edit2,
  Share2,
  Building2,
  Factory,
  Store,
  TreePine,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useProjectsFilters } from "@/hooks/useProjectsFilters";
import { FiltersSidebar } from "./filters/FiltersSidebar";
import { SortDropdown } from "./filters/SortDropdown";
import { EmptyState } from "./EmptyState";
import { Button } from "@/app/components/ui/button";
import type { Project, PropertyType } from "@/types/project";

// Mapping des types de propriete vers l'affichage
const propertyTypeConfig: Record<PropertyType, { icon: typeof Building2; label: string; emoji: string }> = {
  office: { icon: Building2, label: "Bureaux", emoji: "\u{1F3E2}" },
  warehouse: { icon: Factory, label: "Entrepot", emoji: "\u{1F3ED}" },
  retail: { icon: Store, label: "Commerce", emoji: "\u{1F3EA}" },
  industrial: { icon: Factory, label: "Locaux d'activite", emoji: "\u{1F3ED}" },
  land: { icon: TreePine, label: "Terrain", emoji: "\u{1F333}" },
  mixed: { icon: Building2, label: "Mixte", emoji: "\u{1F3D7}" },
};

// Calculer la progression en pourcentage
function calculateProgress(currentStep: number): number {
  return Math.round((currentStep / 5) * 100);
}

function getProgressColor(progress: number): string {
  if (progress === 100) return "bg-green-100 text-green-800";
  if (progress === 0) return "bg-gray-100 text-gray-800";
  return "bg-blue-100 text-blue-800";
}

// Mise en surbrillance des termes recherches
function highlightSearchTerm(text: string, searchTerm: string): React.ReactNode {
  if (!searchTerm || !text) return text;
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark key={index} className="bg-yellow-200 px-0.5 rounded">{part}</mark>
    ) : (
      part
    )
  );
}

interface SearchResultsPageProps {
  initialQuery: string;
  onProjectClick: (project: Project) => void;
  onQueryChange: (query: string) => void;
}

export function SearchResultsPage({
  initialQuery,
  onProjectClick,
  onQueryChange,
}: SearchResultsPageProps) {
  const {
    projects,
    total,
    totalPages,
    metadata,
    filters,
    sort,
    pagination,
    loading,
    error,
    setSearch,
    togglePropertyType,
    setCity,
    setConsultantId,
    setConstructionYearRange,
    setSort,
    setPage,
    resetFilters,
    refetch,
    activeFiltersCount,
  } = useProjectsFilters();

  // Synchroniser avec la recherche du header au montage
  useEffect(() => {
    if (initialQuery && initialQuery !== filters.search) {
      setSearch(initialQuery);
    }
  }, [initialQuery]);

  // Synchroniser le header avec la recherche locale
  useEffect(() => {
    if (filters.search !== initialQuery) {
      onQueryChange(filters.search);
    }
  }, [filters.search]);

  // Chargement initial
  if (loading && projects.length === 0) {
    return (
      <div className="flex flex-1 bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span>Recherche en cours...</span>
          </div>
        </div>
      </div>
    );
  }

  // Erreur
  if (error) {
    return (
      <div className="flex flex-1 bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
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
    );
  }

  return (
    <div className="flex flex-1 bg-gray-50">
      {/* Sidebar Filtres - toujours visible */}
      <FiltersSidebar
        filters={filters}
        metadata={metadata}
        activeFiltersCount={activeFiltersCount}
        onTogglePropertyType={togglePropertyType}
        onCityChange={setCity}
        onConsultantChange={setConsultantId}
        onYearRangeChange={setConstructionYearRange}
        onReset={resetFilters}
        isCollapsed={false}
        onToggleCollapse={() => {}}
      />

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col p-6 min-w-0">
        {/* Header des resultats */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl text-blue-900">
              Resultats de recherche
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {total} resultat{total !== 1 ? 's' : ''} pour "{filters.search}"
              {loading && <Loader2 className="inline w-3 h-3 ml-2 animate-spin" />}
            </p>
          </div>
          <SortDropdown sort={sort} onSortChange={setSort} />
        </div>

        {/* Liste des resultats */}
        <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">
          {projects.length === 0 ? (
            <EmptyState
              title="Aucun resultat"
              description="Aucun projet ne correspond a vos criteres de recherche."
              onReset={resetFilters}
              showResetButton={activeFiltersCount > 0}
            />
          ) : (
            <div className="flex-1 overflow-auto">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 z-10 bg-gray-50">
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">Titre</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">Adresse</th>
                    <th className="text-center px-4 py-4 text-sm font-medium text-gray-700">Type</th>
                    <th className="text-center px-4 py-4 text-sm font-medium text-gray-700">Statut</th>
                    <th className="text-left px-4 py-4 text-sm font-medium text-gray-700">Consultant</th>
                    <th className="text-center px-4 py-4 text-sm font-medium text-gray-700">Annee</th>
                    <th className="text-center px-4 py-4 text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project, index) => {
                    const typeConfig = propertyTypeConfig[project.property_type];
                    const progress = calculateProgress(project.current_step);
                    const progressColor = getProgressColor(progress);

                    return (
                      <tr
                        key={project.id}
                        onClick={() => onProjectClick(project)}
                        className={`border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors ${
                          index % 2 === 1 ? "bg-gray-50" : "bg-white"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{typeConfig.emoji}</span>
                            <span className="font-medium text-gray-900">
                              {highlightSearchTerm(project.title, filters.search)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {highlightSearchTerm(project.address, filters.search)}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700">
                            {typeConfig.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-sm ${progressColor}`}>
                            {progress}%
                          </span>
                        </td>
                        <td className="px-4 py-4 text-gray-600">
                          {project.user.first_name} {project.user.last_name}
                        </td>
                        <td className="px-4 py-4 text-center text-gray-600">
                          {project.property_info?.construction_year ?? "-"}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onProjectClick(project);
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Modifier"
                            >
                              <Edit2 className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Partager"
                            >
                              <Share2 className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Precedent
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
