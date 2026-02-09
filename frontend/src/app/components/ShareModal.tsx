import {
  X,
  Search,
  Users,
  Eye,
  Edit3,
  Shield,
  Trash2,
  Loader2,
  UserPlus,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import {
  getAvailableUsersForShare,
  getProjectShares,
  shareProject,
  updateProjectShare,
  removeProjectShare,
  type UserBrief,
  type ProjectShare,
  type SharePermission,
} from "@/services/projectService";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  projectTitle: string;
}

const permissionConfig: Record<SharePermission, { label: string; description: string; icon: typeof Eye }> = {
  read: {
    label: "Lecture seule",
    description: "Peut voir le projet mais pas le modifier",
    icon: Eye,
  },
  write: {
    label: "Lecture et ecriture",
    description: "Peut voir et modifier le projet",
    icon: Edit3,
  },
  admin: {
    label: "Administrateur",
    description: "Peut voir, modifier et supprimer le projet",
    icon: Shield,
  },
};

export function ShareModal({ isOpen, onClose, projectId, projectTitle }: ShareModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<UserBrief[]>([]);
  const [existingShares, setExistingShares] = useState<ProjectShare[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserBrief | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<SharePermission>("write");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPermissionDropdown, setShowPermissionDropdown] = useState(false);
  const [editingShareId, setEditingShareId] = useState<number | null>(null);

  // Charger les partages existants
  const loadShares = useCallback(async () => {
    setIsLoading(true);
    try {
      const shares = await getProjectShares(projectId);
      setExistingShares(shares);
    } catch (err) {
      console.error("Erreur lors du chargement des partages:", err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (isOpen) {
      loadShares();
      setSearchTerm("");
      setSearchResults([]);
      setSelectedUser(null);
      setError(null);
    }
  }, [isOpen, loadShares]);

  // Recherche d'utilisateurs
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await getAvailableUsersForShare(projectId, searchTerm);
        setSearchResults(results);
      } catch (err) {
        console.error("Erreur lors de la recherche:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, projectId]);

  const handleSelectUser = (user: UserBrief) => {
    setSelectedUser(user);
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleShare = async () => {
    if (!selectedUser) return;

    setIsSharing(true);
    setError(null);

    try {
      await shareProject(projectId, {
        user_id: selectedUser.id,
        permission: selectedPermission,
      });
      setSelectedUser(null);
      setSelectedPermission("write");
      loadShares();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du partage");
    } finally {
      setIsSharing(false);
    }
  };

  const handleUpdatePermission = async (share: ProjectShare, newPermission: SharePermission) => {
    try {
      await updateProjectShare(projectId, share.user_id, newPermission);
      loadShares();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la modification");
    }
    setEditingShareId(null);
  };

  const handleRemoveShare = async (share: ProjectShare) => {
    try {
      await removeProjectShare(projectId, share.user_id);
      loadShares();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Partager le projet</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-500 truncate">"{projectTitle}"</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Recherche d'utilisateur */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ajouter un collaborateur
            </label>

            {selectedUser ? (
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {selectedUser.first_name[0]}{selectedUser.last_name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedUser.first_name} {selectedUser.last_name}
                    </p>
                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1 hover:bg-blue-100 rounded"
                >
                  <X className="w-4 h-4 text-blue-600" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher par nom ou email..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                )}

                {/* Résultats de recherche */}
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium text-sm">
                          {user.first_name[0]}{user.last_name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {searchTerm && !isSearching && searchResults.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500 text-sm">
                    Aucun utilisateur trouve
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sélection de permission */}
          {selectedUser && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Niveau de permission
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowPermissionDropdown(!showPermissionDropdown)}
                  className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {(() => {
                      const config = permissionConfig[selectedPermission];
                      const Icon = config.icon;
                      return (
                        <>
                          <Icon className="w-4 h-4 text-gray-600" />
                          <div className="text-left">
                            <p className="font-medium text-gray-900 text-sm">{config.label}</p>
                            <p className="text-xs text-gray-500">{config.description}</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {showPermissionDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {(Object.entries(permissionConfig) as [SharePermission, typeof permissionConfig.read][]).map(
                      ([key, config]) => {
                        const Icon = config.icon;
                        return (
                          <button
                            key={key}
                            onClick={() => {
                              setSelectedPermission(key);
                              setShowPermissionDropdown(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${
                              selectedPermission === key ? "bg-blue-50" : ""
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${selectedPermission === key ? "text-blue-600" : "text-gray-600"}`} />
                            <div>
                              <p className={`font-medium text-sm ${selectedPermission === key ? "text-blue-600" : "text-gray-900"}`}>
                                {config.label}
                              </p>
                              <p className="text-xs text-gray-500">{config.description}</p>
                            </div>
                          </button>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bouton de partage */}
          {selectedUser && (
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 mb-6"
            >
              {isSharing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Partage en cours...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Partager
                </>
              )}
            </button>
          )}

          {/* Erreur */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Liste des partages existants */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Collaborateurs ({existingShares.length})
            </h3>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              </div>
            ) : existingShares.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Aucun collaborateur pour le moment</p>
              </div>
            ) : (
              <div className="space-y-2">
                {existingShares.map((share) => {
                  const config = permissionConfig[share.permission as SharePermission] || permissionConfig.write;
                  const Icon = config.icon;

                  return (
                    <div
                      key={share.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-semibold text-sm">
                          {share.user.first_name[0]}{share.user.last_name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {share.user.first_name} {share.user.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{share.user.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {editingShareId === share.id ? (
                          <div className="flex items-center gap-1">
                            {(Object.keys(permissionConfig) as SharePermission[]).map((perm) => {
                              const PIcon = permissionConfig[perm].icon;
                              return (
                                <button
                                  key={perm}
                                  onClick={() => handleUpdatePermission(share, perm)}
                                  className={`p-2 rounded-lg transition-colors ${
                                    share.permission === perm
                                      ? "bg-blue-100 text-blue-600"
                                      : "hover:bg-gray-200 text-gray-600"
                                  }`}
                                  title={permissionConfig[perm].label}
                                >
                                  <PIcon className="w-4 h-4" />
                                </button>
                              );
                            })}
                            <button
                              onClick={() => setEditingShareId(null)}
                              className="p-2 hover:bg-gray-200 rounded-lg text-gray-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditingShareId(share.id)}
                              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded transition-colors"
                              title="Modifier les permissions"
                            >
                              <Icon className="w-3 h-3" />
                              {config.label}
                            </button>
                            <button
                              onClick={() => handleRemoveShare(share)}
                              className="p-1.5 hover:bg-red-100 rounded-lg text-red-500 transition-colors"
                              title="Retirer l'acces"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
