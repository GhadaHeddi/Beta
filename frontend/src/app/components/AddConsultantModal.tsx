import { X, Eye, EyeOff, User, Mail, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";

interface AddConsultantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddConsultant: (name: string, email: string, password: string) => void;
}

export function AddConsultantModal({
  isOpen,
  onClose,
  onAddConsultant,
}: AddConsultantModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  if (!isOpen) return null;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): {
    isValid: boolean;
    requirements: {
      length: boolean;
      uppercase: boolean;
      lowercase: boolean;
      number: boolean;
    };
  } => {
    return {
      isValid:
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password),
      requirements: {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
      },
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = "Le nom est requis";
    } else if (name.trim().length < 2) {
      newErrors.name = "Le nom doit contenir au moins 2 caractères";
    }

    if (!email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!validateEmail(email)) {
      newErrors.email = "L'email n'est pas valide";
    }

    const passwordValidation = validatePassword(password);
    if (!password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (!passwordValidation.isValid) {
      newErrors.password = "Le mot de passe ne respecte pas les critères requis";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "La confirmation du mot de passe est requise";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onAddConsultant(name, email, password);
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setErrors({});
    }
  };

  const passwordValidation = validatePassword(password);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 rounded-t-xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl text-white font-semibold">
            Ajouter un consultant
          </h2>
          <p className="text-blue-100 text-sm mt-1">
            Créez un compte pour un nouveau membre de votre équipe
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nom */}
          <div>
            <label className="block text-sm text-gray-700 mb-2 font-medium">
              Nom complet
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) {
                    setErrors({ ...errors, name: undefined });
                  }
                }}
                placeholder="Ex: Jean Dupont"
                className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.name
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
            </div>
            {errors.name && (
              <div className="flex items-center gap-1 mt-1.5 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <p className="text-xs">{errors.name}</p>
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-700 mb-2 font-medium">
              Adresse email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors({ ...errors, email: undefined });
                  }
                }}
                placeholder="exemple@email.com"
                className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.email
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
            </div>
            {errors.email && (
              <div className="flex items-center gap-1 mt-1.5 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <p className="text-xs">{errors.email}</p>
              </div>
            )}
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block text-sm text-gray-700 mb-2 font-medium">
              Mot de passe temporaire
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors({ ...errors, password: undefined });
                  }
                }}
                placeholder="••••••••"
                className={`w-full pl-11 pr-11 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.password
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <div className="flex items-center gap-1 mt-1.5 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <p className="text-xs">{errors.password}</p>
              </div>
            )}

            {/* Password Requirements */}
            {password && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-2">
                <p className="text-xs text-gray-600 font-medium mb-2">
                  Le mot de passe doit contenir :
                </p>
                <div className="space-y-1.5">
                  <div
                    className={`flex items-center gap-2 text-xs ${
                      passwordValidation.requirements.length
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        passwordValidation.requirements.length
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    />
                    <span>Au moins 8 caractères</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 text-xs ${
                      passwordValidation.requirements.uppercase
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        passwordValidation.requirements.uppercase
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    />
                    <span>Une lettre majuscule</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 text-xs ${
                      passwordValidation.requirements.lowercase
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        passwordValidation.requirements.lowercase
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    />
                    <span>Une lettre minuscule</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 text-xs ${
                      passwordValidation.requirements.number
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        passwordValidation.requirements.number
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    />
                    <span>Un chiffre</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirmation du mot de passe */}
          <div>
            <label className="block text-sm text-gray-700 mb-2 font-medium">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) {
                    setErrors({ ...errors, confirmPassword: undefined });
                  }
                }}
                placeholder="••••••••"
                className={`w-full pl-11 pr-11 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.confirmPassword
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <div className="flex items-center gap-1 mt-1.5 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <p className="text-xs">{errors.confirmPassword}</p>
              </div>
            )}
            {confirmPassword &&
              password === confirmPassword &&
              !errors.confirmPassword && (
                <div className="flex items-center gap-1 mt-1.5 text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <p className="text-xs">Les mots de passe correspondent</p>
                </div>
              )}
          </div>

          {/* Info box */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700">
              Le consultant recevra un email avec ses identifiants de connexion.
              Il sera invité à modifier son mot de passe lors de sa première connexion.
            </p>
          </div>

          {/* Bouton de soumission */}
          <button
            type="submit"
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-base mt-6"
          >
            Créer le compte consultant
          </button>
        </form>
      </div>
    </div>
  );
}
