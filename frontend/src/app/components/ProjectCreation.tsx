import { Plus } from "lucide-react";
import { useState } from "react";
import { CreateValueModal } from "@/app/components/CreateValueModal";

interface ProjectCreationProps {
  onStartEvaluation: (
    title: string,
    address: string,
    propertyType: string,
  ) => void;
}

export function ProjectCreation({
  onStartEvaluation,
}: ProjectCreationProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreate = (
    title: string,
    address: string,
    propertyType: string,
  ) => {
    console.log("Nouvel avis de valeur créé:", {
      title,
      address,
      propertyType,
    });
    // Fermer le modal et démarrer le processus d'évaluation
    setIsModalOpen(false);
    onStartEvaluation(title, address, propertyType);
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
      />
    </>
  );
}