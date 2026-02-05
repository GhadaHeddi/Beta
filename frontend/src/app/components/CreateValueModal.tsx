import { X } from "lucide-react";
import { useState } from "react";

interface CreateValueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (id: number, title: string, address: string, propertyType: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function CreateValueModal({ isOpen, onClose, onCreate, isLoading = false, error = null }: CreateValueModalProps) {
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [propertyType, setPropertyType] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && address.trim() && propertyType && !isLoading) {
      onCreate(0, title, address, propertyType); // ProjectCreation gère l'appel API
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setTitle("");
      setAddress("");
      setPropertyType("");
      onClose();
    }
  };

  const isFormValid = title.trim() && address.trim() && propertyType;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay semi-transparent avec flou */}
      <div
        className="absolute inset-0 backdrop-blur-[4px]"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)' }}
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-[0_25px_70px_rgba(0,0,0,0.4)] w-full max-w-md z-10">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl text-blue-900">
              Créer un nouvel avis de valeur
            </h3>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm text-gray-700 mb-2">
                  Titre du projet
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Bureaux Quartier Affaires"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="propertyType" className="block text-sm text-gray-700 mb-2">
                  Type de bien <span className="text-red-600">*</span>
                </label>
                <select
                  id="propertyType"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  required
                >
                  <option value="">Sélectionnez le type de bien...</option>
                  <option value="office">Bureaux</option>
                  <option value="industrial">Locaux d'activité</option>
                  <option value="retail">Local commercial</option>
                  <option value="warehouse">Entrepôt</option>
                  <option value="land">Terrain</option>
                  <option value="mixed">Mixte</option>
                </select>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm text-gray-700 mb-2">
                  Adresse du bien
                </label>
                <input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex: 15 Avenue Charles de Gaulle, 92200 Neuilly"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className={`flex-1 px-4 py-2.5 text-white rounded-lg transition-colors ${
                  isFormValid && !isLoading
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {isLoading ? 'Création...' : 'Créer le projet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
