import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";

const API_BASE_URL = "http://localhost:8000/api";

interface UserData {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  avatar_url?: string;
  phone?: string;
  created_at?: string;
  agency_id?: number;
  agency_name?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  currentUser: UserData | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const hasToken = !!localStorage.getItem("access_token");

  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("access_token")
  );
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(hasToken);

  const fetchCurrentUser = useCallback(async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const user = await response.json();
        setCurrentUser(user);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem("access_token");
        setAccessToken(null);
        setIsAuthenticated(false);
      }
    } catch {
      localStorage.removeItem("access_token");
      setAccessToken(null);
      setIsAuthenticated(false);
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    if (accessToken) {
      fetchCurrentUser(accessToken);
    }
  }, [accessToken, fetchCurrentUser]);

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.access_token;
        localStorage.setItem("access_token", token);
        setAccessToken(token);
        setIsAuthLoading(true);
        return null;
      } else {
        const errorData = await response.json();
        return errorData.detail || "Email ou mot de passe incorrect";
      }
    } catch {
      return "Erreur de connexion au serveur";
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (accessToken) {
      await fetchCurrentUser(accessToken);
    }
  }, [accessToken, fetchCurrentUser]);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    setAccessToken(null);
    setCurrentUser(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isAuthLoading, currentUser, accessToken, login, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
