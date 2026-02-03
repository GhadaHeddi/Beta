import { 
  User, 
  Settings, 
  Briefcase, 
  BarChart3, 
  Palette, 
  BookOpen, 
  MessageCircle, 
  FileText,
  LogOut,
  ChevronRight
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  userName: string;
  userEmail: string;
  userRole: string;
  userInitials: string;
  userAvatar?: string;
}

export function ProfileDropdown({ 
  isOpen, 
  onClose, 
  onLogout,
  userName,
  userEmail,
  userRole,
  userInitials,
  userAvatar
}: ProfileDropdownProps) {
  const [theme, setTheme] = useState<"light" | "dark" | "auto">("light");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const MenuItem = ({ 
    icon: Icon, 
    label, 
    onClick,
    danger = false,
    showChevron = false
  }: { 
    icon: any; 
    label: string; 
    onClick?: () => void;
    danger?: boolean;
    showChevron?: boolean;
  }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${
        danger 
          ? "text-red-600 hover:bg-red-50" 
          : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </div>
      {showChevron && <ChevronRight className="w-4 h-4 text-gray-400" />}
    </button>
  );

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-[280px] bg-white rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.15)] z-[1000] animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden"
    >
      {/* Profile Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          {userAvatar ? (
            <img 
              src={userAvatar} 
              alt={userName}
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              {userInitials}
            </div>
          )}
          
          {/* User Info */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{userName}</p>
            <p className="text-xs text-gray-500 truncate">{userEmail}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
              {userRole}
            </span>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-2">
        <MenuItem icon={User} label="Mon profil" />
        <MenuItem icon={Settings} label="Paramètres du compte" showChevron />
        <MenuItem icon={Briefcase} label="Mes projets" />
        <MenuItem icon={BarChart3} label="Statistiques" />
      </div>

      {/* Theme Section */}
      <div className="px-4 py-3 border-t border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Apparence</span>
        </div>
        <div className="space-y-2 ml-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="theme"
              value="light"
              checked={theme === "light"}
              onChange={(e) => setTheme(e.target.value as "light")}
              className="text-blue-600"
            />
            <span className="text-sm text-gray-700">☀️ Clair</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="theme"
              value="dark"
              checked={theme === "dark"}
              onChange={(e) => setTheme(e.target.value as "dark")}
              className="text-blue-600"
            />
            <span className="text-sm text-gray-700">🌙 Sombre</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="theme"
              value="auto"
              checked={theme === "auto"}
              onChange={(e) => setTheme(e.target.value as "auto")}
              className="text-blue-600"
            />
            <span className="text-sm text-gray-700">⚡ Auto</span>
          </label>
        </div>
      </div>

      {/* Help Section */}
      <div className="py-2">
        <MenuItem icon={BookOpen} label="Centre d'aide" />
        <MenuItem icon={MessageCircle} label="Nous contacter" />
        <MenuItem icon={FileText} label="Conditions d'utilisation" />
      </div>

      {/* Logout */}
      <div className="py-2 border-t border-gray-200">
        <MenuItem icon={LogOut} label="Se déconnecter" onClick={onLogout} danger />
      </div>
    </div>
  );
}