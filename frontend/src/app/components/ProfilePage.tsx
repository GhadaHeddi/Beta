import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Pencil, X, Save } from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = "http://localhost:8000/api";

interface ProfilePageProps {
  onBack: () => void;
}

export function ProfilePage({ onBack }: ProfilePageProps) {
  const { currentUser, accessToken, refreshUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: currentUser?.first_name ?? "",
    last_name: currentUser?.last_name ?? "",
    email: currentUser?.email ?? "",
    phone: currentUser?.phone ?? "",
  });

  if (!currentUser) return null;

  const initials = `${currentUser.first_name[0]}${currentUser.last_name[0]}`.toUpperCase();
  const roleName = currentUser.role === "admin" ? "Administrateur" : "Consultant";
  const createdAt = currentUser.created_at
    ? new Date(currentUser.created_at).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  const handleCancel = () => {
    setFormData({
      first_name: currentUser.first_name,
      last_name: currentUser.last_name,
      email: currentUser.email,
      phone: currentUser.phone ?? "",
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    // Client-side validation
    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.email.trim()) {
      toast.error("Le nom, le prénom et l'email sont obligatoires");
      return;
    }

    // Only send changed fields
    const changed: Record<string, string> = {};
    if (formData.first_name !== currentUser.first_name) changed.first_name = formData.first_name;
    if (formData.last_name !== currentUser.last_name) changed.last_name = formData.last_name;
    if (formData.email !== currentUser.email) changed.email = formData.email;
    if (formData.phone !== (currentUser.phone ?? "")) changed.phone = formData.phone;

    if (Object.keys(changed).length === 0) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(changed),
      });

      if (response.ok) {
        await refreshUser();
        toast.success("Profil mis à jour avec succès");
        setIsEditing(false);
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || "Erreur lors de la mise à jour");
      }
    } catch {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-10 px-4">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Retour</span>
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header with avatar */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-10 flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-2xl border-2 border-white/40">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {currentUser.first_name} {currentUser.last_name}
              </h1>
              <span className="inline-block mt-1 px-3 py-0.5 bg-white/20 text-white text-sm rounded-full">
                {roleName}
              </span>
            </div>
          </div>

          {/* Actions bar */}
          <div className="px-8 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Informations personnelles</h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Pencil className="w-4 h-4" />
                Modifier
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            )}
          </div>

          {/* Form fields */}
          <div className="px-8 py-6 space-y-6">
            {/* Prénom */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Prénom</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 py-2.5">{currentUser.first_name}</p>
              )}
            </div>

            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Nom</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 py-2.5">{currentUser.last_name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 py-2.5">{currentUser.email}</p>
              )}
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Téléphone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Non renseigné"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 py-2.5">{currentUser.phone || "Non renseigné"}</p>
              )}
            </div>

            {/* Read-only fields */}
            <div className="pt-4 border-t border-gray-200 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Rôle</label>
                <p className="text-gray-900 py-2.5">{roleName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Membre depuis</label>
                <p className="text-gray-900 py-2.5">{createdAt}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
