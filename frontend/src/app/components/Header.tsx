import {
  Building2,
  Search,
  Bell,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";
import { useState } from "react";
import { LoginModal } from "@/app/components/LoginModal";
import { SignUpModal } from "@/app/components/SignUpModal";
import { InboxDropdown } from "@/app/components/InboxDropdown";
import { ProfileDropdown } from "@/app/components/ProfileDropdown";
import { LogoutConfirmModal } from "@/app/components/LogoutConfirmModal";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  onLogoClick?: () => void;
  onDashboardClick?: () => void;
}

export function Header({ onLogoClick, onDashboardClick }: HeaderProps) {
  const { user, isAuthenticated, login, register, logout, error, clearError } = useAuth();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [authError, setAuthError] = useState<string | null>(null);

  // Données utilisateur depuis le contexte
  const userData = user ? {
    name: `${user.first_name} ${user.last_name}`,
    email: user.email,
    role: "Utilisateur",
    initials: `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase(),
    avatar: user.avatar_url,
  } : {
    name: "Invité",
    email: "",
    role: "",
    initials: "?",
    avatar: undefined,
  };

  const handleLogin = async (email: string, password: string) => {
    setAuthError(null);
    try {
      await login(email, password);
      setIsLoginModalOpen(false);
      setUnreadCount(3);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Erreur de connexion");
    }
  };

  const handleSignUp = async (
    name: string,
    email: string,
    password: string,
  ) => {
    setAuthError(null);
    try {
      // Séparer le nom en prénom et nom
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || name;
      const lastName = nameParts.slice(1).join(' ') || name;

      await register(email, password, firstName, lastName);
      setIsSignUpModalOpen(false);
      setUnreadCount(3);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Erreur d'inscription");
    }
  };

  const handleSwitchToSignUp = () => {
    setAuthError(null);
    clearError();
    setIsLoginModalOpen(false);
    setIsSignUpModalOpen(true);
  };

  const handleSwitchToLogin = () => {
    setAuthError(null);
    clearError();
    setIsSignUpModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const handleLogoutClick = () => {
    setIsProfileOpen(false);
    setIsLogoutModalOpen(true);
  };

  const handleLogoutConfirm = async () => {
    await logout();
    setIsLogoutModalOpen(false);
    setUnreadCount(0);
  };

  const handleDashboardClick = () => {
    if (onDashboardClick) {
      onDashboardClick();
    }
  };

  const handleModalClose = () => {
    setAuthError(null);
    clearError();
    setIsLoginModalOpen(false);
  };

  const handleSignUpModalClose = () => {
    setAuthError(null);
    clearError();
    setIsSignUpModalOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 bg-white border-b border-gray-200 px-8 py-4 z-30 h-24">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          <button
            onClick={onLogoClick}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-red-700 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl text-blue-900">Oryem</h1>
          </button>

          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un projet, une adresse..."
                className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {!isAuthenticated ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-6 py-2.5 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
              >
                Se connecter
              </button>
              <button
                onClick={() => setIsSignUpModalOpen(true)}
                className="px-6 py-2.5 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
              >
                S'inscrire
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {/* Dashboard Button */}
              <button
                onClick={handleDashboardClick}
                className="w-10 h-10 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center"
              >
                <LayoutDashboard className="w-5 h-5 text-gray-700" />
              </button>

              {/* Inbox Button */}
              <div className="relative">
                <button
                  aria-label="inbox"
                  onClick={() => {
                    setIsInboxOpen(!isInboxOpen);
                    setIsProfileOpen(false);
                  }}
                  className="w-10 h-10 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center relative"
                >
                  <Bell className="w-5 h-5 text-gray-700" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                <InboxDropdown
                  isOpen={isInboxOpen}
                  onClose={() => setIsInboxOpen(false)}
                  unreadCount={unreadCount}
                  onUnreadCountChange={setUnreadCount}
                />
              </div>

              {/* Separator */}
              <div className="w-px h-6 bg-gray-300" />

              {/* Profile Button */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsProfileOpen(!isProfileOpen);
                    setIsInboxOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {/* Avatar */}
                  {userData.avatar ? (
                    <img
                      src={userData.avatar}
                      alt={userData.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {userData.initials}
                    </div>
                  )}

                  {/* Username */}
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-medium text-gray-900">
                      {userData.name}
                    </p>
                    <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                      {userData.role}
                    </span>
                  </div>

                  {/* Chevron */}
                  <ChevronDown className="w-4 h-4 text-gray-500 hidden md:block" />
                </button>

                <ProfileDropdown
                  isOpen={isProfileOpen}
                  onClose={() => setIsProfileOpen(false)}
                  onLogout={handleLogoutClick}
                  userName={userData.name}
                  userEmail={userData.email}
                  userRole={userData.role}
                  userInitials={userData.initials}
                  userAvatar={userData.avatar}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleModalClose}
        onLogin={handleLogin}
        onSwitchToSignUp={handleSwitchToSignUp}
        error={authError || error}
      />

      <SignUpModal
        isOpen={isSignUpModalOpen}
        onClose={handleSignUpModalClose}
        onSignUp={handleSignUp}
        onSwitchToLogin={handleSwitchToLogin}
        error={authError || error}
      />

      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
}
