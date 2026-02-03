import { X, Building2 } from "lucide-react";
import { useState } from "react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, password: string) => void;
  onSwitchToSignUp?: () => void;
}

export function LoginModal({ isOpen, onClose, onLogin, onSwitchToSignUp }: LoginModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
      onLogin(username, password);
      setUsername("");
      setPassword("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Fond rouge avec dégradé et formes organiques */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-[#8B1818] to-[#D32F2F]"
        onClick={onClose}
      >
        {/* Formes organiques courbes en arrière-plan */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Forme organique 1 - en haut à gauche */}
          <svg className="absolute -top-32 -left-32 w-96 h-96 opacity-20" viewBox="0 0 400 400">
            <path
              d="M 100 0 Q 200 50 300 100 T 400 300 Q 350 400 200 400 T 0 200 Q 50 100 100 0"
              fill="white"
            />
          </svg>

          {/* Forme organique 2 - en haut à droite */}
          <svg className="absolute -top-20 -right-40 w-[500px] h-[500px] opacity-20" viewBox="0 0 500 500">
            <path
              d="M 250 0 Q 400 100 500 250 T 400 500 Q 250 450 100 400 T 0 150 Q 100 50 250 0"
              fill="white"
            />
          </svg>

          {/* Forme organique 3 - au centre */}
          <svg className="absolute top-1/3 left-1/4 w-80 h-80 opacity-20" viewBox="0 0 300 300">
            <path
              d="M 150 0 Q 250 50 300 150 T 200 300 Q 100 280 0 200 T 50 50 Q 100 0 150 0"
              fill="white"
            />
          </svg>

          {/* Forme organique 4 - en bas à gauche */}
          <svg className="absolute -bottom-40 -left-20 w-[450px] h-[450px] opacity-20" viewBox="0 0 450 450">
            <path
              d="M 0 225 Q 100 100 225 0 T 450 150 Q 400 300 300 400 T 100 450 Q 0 350 0 225"
              fill="white"
            />
          </svg>

          {/* Forme organique 5 - en bas à droite */}
          <svg className="absolute -bottom-32 -right-32 w-[550px] h-[550px] opacity-20" viewBox="0 0 550 550">
            <path
              d="M 275 0 Q 450 80 550 275 T 400 550 Q 200 500 0 400 T 100 100 Q 150 0 275 0"
              fill="white"
            />
          </svg>

          {/* Forme organique 6 - ondulation centrale droite */}
          <svg className="absolute top-1/2 -right-24 w-64 h-96 opacity-20" viewBox="0 0 200 300">
            <path
              d="M 0 0 Q 100 75 100 150 T 0 300 L 200 300 Q 150 225 150 150 T 200 0 Z"
              fill="white"
            />
          </svg>
        </div>
      </div>
      
      {/* Modal - carte blanche */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden z-10">
        {/* Fond rouge design moderne avec pattern */}
        <div className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-800 px-8 py-12">
          {/* Pattern décoratif */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24"></div>
          </div>
          
          {/* Bouton fermer */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Logo et titre */}
          <div className="relative flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <Building2 className="w-9 h-9 text-red-700" />
            </div>
            <h2 className="text-3xl text-white mb-2">
              Oryem
            </h2>
            <p className="text-red-100 text-sm">
              Plateforme d'avis de valeur professionnels
            </p>
          </div>
        </div>

        {/* Formulaire */}
        <div className="px-8 py-8">
          <h3 className="text-xl text-blue-900 mb-6 text-center">
            Connectez-vous à votre compte
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm text-gray-700 mb-2">
                  Nom d'utilisateur
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Votre nom d'utilisateur"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm text-gray-700 mb-2">
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Actions */}
            <button
              type="submit"
              className="w-full mt-6 px-4 py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors shadow-md"
            >
              Se connecter
            </button>

            <div className="mt-4 text-center">
              <a href="#" className="text-sm text-red-700 hover:text-red-800">
                Mot de passe oublié ?
              </a>
            </div>

            {onSwitchToSignUp && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Pas encore de compte ?{" "}
                  <button
                    type="button"
                    onClick={onSwitchToSignUp}
                    className="text-red-700 hover:text-red-800 font-medium transition-colors"
                  >
                    S'inscrire
                  </button>
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}