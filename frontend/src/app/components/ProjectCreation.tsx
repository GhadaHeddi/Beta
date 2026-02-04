import { Plus } from "lucide-react";
import { useState } from "react";
import { CreateValueModal } from "@/app/components/CreateValueModal";
import { useProjects } from "@/hooks/useProjects";
import { useAuth } from "@/contexts/AuthContext";

interface ProjectCreationProps {
  onStartEvaluation: (
    title: string,
    address: string,
    propertyType: string,
    projectId?: number,
  ) => void;
}

export function ProjectCreation({
  onStartEvaluation,
}: ProjectCreationProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { createProject, mapPropertyType, isLoading, error } = useProjects();
  const { isAuthenticated } = useAuth();

  const handleCreate = async (
    title: string,
    address: string,
    propertyType: string,
  ) => {
    // Si l'utilisateur est connecté, créer le projet via l'API
    if (isAuthenticated) {
      const project = await createProject({
        title,
        address,
        property_type: mapPropertyType(propertyType),
      });

      if (project) {
        setIsModalOpen(false);
        onStartEvaluation(title, address, propertyType, project.id);
      }
    } else {
      // Mode démo sans authentification
      console.log("Mode démo - Nouvel avis de valeur créé:", {
        title,
        address,
        propertyType,
      });
      setIsModalOpen(false);
      onStartEvaluation(title, address, propertyType);
    }
  };

  return (
    <>
      <div className="bg-gray-50 px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <h2 className="text-3xl text-blue-900 mb-3">
              Nouvel avis de valeur
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Estimez la valeur de votre bien professionnel en
              quelques clics
            </p>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <button
              onClick={() => setIsModalOpen(true)}
              disabled={isLoading}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors shadow-md text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-6 h-6" />
              {isLoading ? "Création en cours..." : "Créer un nouvel avis de valeur"}
            </button>

            {!isAuthenticated && (
              <p className="mt-4 text-sm text-gray-500">
                Connectez-vous pour sauvegarder vos projets
              </p>
            )}
          </div>
        </div>
      </div>

      <CreateValueModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
      />
    </>
  );
}
