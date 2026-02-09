import {
  Building2,
  Search,
  Bell,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";
import { useState, useEffect } from "react";
import { LoginModal } from "@/app/components/LoginModal";
import { InboxDropdown } from "@/app/components/InboxDropdown";
import { ProfileDropdown } from "@/app/components/ProfileDropdown";
import { LogoutConfirmModal } from "@/app/components/LogoutConfirmModal";
import { AddConsultantModal } from "@/app/components/AddConsultantModal";

const API_BASE_URL = "http://localhost:8000/api";

interface UserData {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  avatar_url?: string;
}

interface HeaderProps {
  onLogoClick?: () => void;
  onDashboardClick?: () => void;
  searchQuery?: string;
  onSearch?: (query: string) => void;
}

export function Header({ onLogoClick, onDashboardClick, searchQuery = "", onSearch }: HeaderProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isAddConsultantModalOpen, setIsAddConsultantModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setAccessToken(token);
      fetchCurrentUser(token);
    }
  }, []);

  const fetchCurrentUser = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const user = await response.json();
        setCurrentUser(user);
        setIsAuthenticated(true);
        setIsLoginModalOpen(false);
      } else {
        // Token invalid, clear it
        localStorage.removeItem("access_token");
        setAccessToken(null);
        setIsAuthenticated(false);
        setIsLoginModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      localStorage.removeItem("access_token");
      setIsAuthenticated(false);
      setIsLoginModalOpen(true);
    }
  };

  // Compute userData from currentUser
  const userData = currentUser
    ? {
        name: `${currentUser.first_name} ${currentUser.last_name}`,
        email: currentUser.email,
        role: currentUser.role === "admin" ? "Administrateur" : "Consultant",
        initials: `${currentUser.first_name[0]}${currentUser.last_name[0]}`.toUpperCase(),
        avatar: currentUser.avatar_url,
      }
    : {
        name: "",
        email: "",
        role: "",
        initials: "",
        avatar: undefined,
      };

  const handleLogin = async (email: string, password: string) => {
    setLoginError(null);
    try {
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.access_token;
        localStorage.setItem("access_token", token);
        setAccessToken(token);
        await fetchCurrentUser(token);
        setUnreadCount(3);
      } else {
        const errorData = await response.json();
        setLoginError(errorData.detail || "Email ou mot de passe incorrect");
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("Erreur de connexion au serveur");
    }
  };

  const handleAddConsultant = async (name: string, email: string, password: string) => {
    if (!accessToken) return;

    try {
      // Parse name into first_name and last_name
      const nameParts = name.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const response = await fetch(`${API_BASE_URL}/admin/consultants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
        }),
      });

      if (response.ok) {
        setIsAddConsultantModalOpen(false);
        alert("Consultant créé avec succès !");
      } else {
        const errorData = await response.json();
        alert(errorData.detail || "Erreur lors de la création du consultant");
      }
    } catch (error) {
      console.error("Error creating consultant:", error);
      alert("Erreur de connexion au serveur");
    }
  };

  const handleOpenAddConsultant = () => {
    setIsProfileOpen(false);
    setIsAddConsultantModalOpen(true);
  };

  const handleLogoutClick = () => {
    setIsProfileOpen(false);
    setIsLogoutModalOpen(true);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem("access_token");
    setAccessToken(null);
    setCurrentUser(null);
    setIsLogoutModalOpen(false);
    setIsAuthenticated(false);
    setIsLoginModalOpen(true);
    setUnreadCount(0);
  };

  const handleDashboardClick = () => {
    if (onDashboardClick) {
      onDashboardClick();
    }
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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  onSearch?.(searchQuery);
                }
              }}
              className="relative"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearch?.(e.currentTarget.value)}
                placeholder="Rechercher un projet, une adresse..."
                className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </form>
          </div>

          {!isAuthenticated ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-6 py-2.5 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
              >
                Se connecter
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
                  onAddConsultant={handleOpenAddConsultant}
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
        onLogin={handleLogin}
        error={loginError}
      />

      <AddConsultantModal
        isOpen={isAddConsultantModalOpen}
        onClose={() => setIsAddConsultantModalOpen(false)}
        onAddConsultant={handleAddConsultant}
      />

      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
}