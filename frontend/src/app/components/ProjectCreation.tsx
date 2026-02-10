import { Plus } from "lucide-react";
import { useState } from "react";
import { CreateValueModal } from "@/app/components/CreateValueModal";
import { createProjectAuth } from "@/services/projectService";
import type { PropertyType } from "@/types/project";

interface ProjectCreationProps {
  onStartEvaluation: (
    id: number,
    title: string,
    address: string,
    propertyType: string,
  ) => void;
}

export function ProjectCreation({
  onStartEvaluation,
}: ProjectCreationProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (
    _id: number, // Ignoré car on récupère l'ID de l'API
    title: string,
    address: string,
    propertyType: string,
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Appel API pour créer le projet en BDD
      const newProject = await createProjectAuth({
        title,
        address,
        property_type: propertyType as PropertyType,
      });

      console.log("Projet créé en BDD:", newProject);

      // Fermer le modal et démarrer le processus d'évaluation avec l'ID réel
      setIsModalOpen(false);
      onStartEvaluation(newProject.id, title, address, propertyType);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la création";
      setError(message);
      console.error("Erreur création projet:", message);
    } finally {
      setIsLoading(false);
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
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors shadow-md text-lg"
            >
              <Plus className="w-6 h-6" />
              Créer un nouvel avis de valeur
            </button>
          </div>
        </div>
      </div>

      <CreateValueModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
        isLoading={isLoading}
        error={error}
      />
    </>
  );
}
