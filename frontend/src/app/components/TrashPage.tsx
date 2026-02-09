import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  Loader2,
  AlertCircle,
  RefreshCw,
  X,
  ArrowLeft,
  Building2,
  Factory,
  Store,
  TreePine,
  Clock,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { getTrashProjectsAuth, restoreProjectAuth, permanentDeleteProjectAuth } from "@/services/projectService";
import type { Project, PropertyType } from "@/types/project";

// Mapping des types de propriete
const propertyTypeConfig: Record<PropertyType, { icon: typeof Building2; label: string; emoji: string }> = {
  office: { icon: Building2, label: "Bureaux", emoji: "\u{1F3E2}" },
  warehouse: { icon: Factory, label: "Entrepot", emoji: "\u{1F3ED}" },
  retail: { icon: Store, label: "Commerce", emoji: "\u{1F3EA}" },
  industrial: { icon: Factory, label: "Locaux d'activite", emoji: "\u{1F3ED}" },
  land: { icon: TreePine, label: "Terrain", emoji: "\u{1F333}" },
  mixed: { icon: Building2, label: "Mixte", emoji: "\u{1F3D7}" },
};

// Calculer les jours restants avant suppression definitive
function getDaysRemaining(deletedAt: string): number {
  const deletedDate = new Date(deletedAt);
  const now = new Date();
  const diffTime = 15 * 24 * 60 * 60 * 1000 - (now.getTime() - deletedDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

// Formater la date de suppression
function formatDeletedDate(deletedAt: string): string {
  const date = new Date(deletedAt);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface TrashPageProps {
  onBack: () => void;
  isAdmin?: boolean;
}

export function TrashPage({ onBack, isAdmin = false }: TrashPageProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectToRestore, setProjectToRestore] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTrashProjectsAuth();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleRestoreClick = (project: Project) => {
    setProjectToRestore(project);
    setActionError(null);
  };

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setActionError(null);
  };

  const handleConfirmRestore = async () => {
    if (!projectToRestore) return;

    setIsProcessing(true);
    setActionError(null);

    try {
      await restoreProjectAuth(projectToRestore.id);
      setProjectToRestore(null);
      fetchProjects();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Erreur lors de la restauration");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;

    setIsProcessing(true);
    setActionError(null);

    try {
      await permanentDeleteProjectAuth(projectToDelete.id);
      setProjectToDelete(null);
      fetchProjects();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Erreur lors de la suppression");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelAction = () => {
    setProjectToRestore(null);
    setProjectToDelete(null);
    setActionError(null);
  };

  // Affichage du chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <Trash2 className="w-6 h-6 text-gray-600" />
              <h1 className="text-2xl font-semibold text-blue-900">Corbeille</h1>
            </div>
          </div>
        </div>
        <div className="px-8 py-8">
          <div className="bg-white rounded-lg border border-gray-200 h-[60vh] flex items-center justify-center">
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
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <Trash2 className="w-6 h-6 text-gray-600" />
              <h1 className="text-2xl font-semibold text-blue-900">Corbeille</h1>
            </div>
          </div>
        </div>
        <div className="px-8 py-8">
          <div className="bg-white rounded-lg border border-gray-200 h-[60vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-red-600">
              <AlertCircle className="w-8 h-8" />
              <span>{error}</span>
              <button
                onClick={fetchProjects}
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <Trash2 className="w-6 h-6 text-gray-600" />
              <h1 className="text-2xl font-semibold text-blue-900">Corbeille</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {projects.length} projet{projects.length > 1 ? "s" : ""} dans la corbeille
            </span>
            {isAdmin && (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full font-medium">
                Vue administrateur
              </span>
            )}
          </div>
        </div>

        {/* Message informatif */}
        <div className="mt-4 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-800">
              Les projets dans la corbeille seront automatiquement supprimes apres <strong>15 jours</strong>.
              Vous pouvez les restaurer ou les supprimer definitivement avant cette date.
            </p>
            {isAdmin && (
              <p className="text-sm text-amber-700 mt-1">
                En tant qu'administrateur, vous voyez tous les projets supprimes de votre equipe.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Liste des projets */}
      <div className="px-8 py-8">
        {projects.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 h-[60vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-gray-500">
              <Trash2 className="w-12 h-12 text-gray-300" />
              <span className="text-lg">La corbeille est vide</span>
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour a l'accueil
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">
                    Projet
                  </th>
                  {isAdmin && (
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">
                      Proprietaire
                    </th>
                  )}
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">
                    Adresse
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">
                    Supprime le
                  </th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-gray-700">
                    Jours restants
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project, index) => {
                  const typeConfig = propertyTypeConfig[project.property_type];
                  const daysRemaining = project.deleted_at ? getDaysRemaining(project.deleted_at) : 0;

                  return (
                    <tr
                      key={project.id}
                      className={`border-b border-gray-100 ${
                        index % 2 === 1 ? "bg-gray-50" : "bg-white"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{typeConfig.emoji}</span>
                          <div>
                            <p className="font-medium text-gray-900">{project.title}</p>
                            <p className="text-sm text-gray-500">{typeConfig.label}</p>
                          </div>
                        </div>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-gray-700">
                          {project.user.first_name} {project.user.last_name}
                        </td>
                      )}
                      <td className="px-6 py-4 text-gray-700">
                        {project.address}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {project.deleted_at ? formatDeletedDate(project.deleted_at) : "-"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Clock className={`w-4 h-4 ${daysRemaining <= 3 ? "text-red-500" : "text-gray-400"}`} />
                          <span
                            className={`font-medium ${
                              daysRemaining <= 3
                                ? "text-red-600"
                                : daysRemaining <= 7
                                ? "text-amber-600"
                                : "text-gray-700"
                            }`}
                          >
                            {daysRemaining} jour{daysRemaining > 1 ? "s" : ""}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRestoreClick(project)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Restaurer le projet"
                          >
                            <RotateCcw className="w-4 h-4" />
                            Restaurer
                          </button>
                          <button
                            onClick={() => handleDeleteClick(project)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer definitivement"
                          >
                            <Trash2 className="w-4 h-4" />
                            Supprimer
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

      {/* Modale de restauration */}
      {projectToRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleCancelAction}
          />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <button
              onClick={handleCancelAction}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <RotateCcw className="w-6 h-6 text-blue-600" />
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Restaurer le projet ?
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Le projet <span className="font-medium">"{projectToRestore.title}"</span> sera restaure et reapparaitra dans vos projets.
            </p>

            {actionError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 text-center">{actionError}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleCancelAction}
                disabled={isProcessing}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmRestore}
                disabled={isProcessing}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Restauration...
                  </>
                ) : (
                  "Restaurer"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale de suppression definitive */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleCancelAction}
          />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <button
              onClick={handleCancelAction}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Suppression definitive
            </h3>
            <p className="text-gray-600 text-center mb-2">
              Le projet <span className="font-medium">"{projectToDelete.title}"</span> sera definitivement supprime.
            </p>
            <p className="text-sm text-red-600 text-center mb-6 font-medium">
              Cette action est irreversible !
            </p>

            {actionError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 text-center">{actionError}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleCancelAction}
                disabled={isProcessing}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isProcessing}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Suppression...
                  </>
                ) : (
                  "Supprimer definitivement"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
