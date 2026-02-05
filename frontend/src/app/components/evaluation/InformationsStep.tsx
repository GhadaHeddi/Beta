import {
  Plus,
  Upload,
  FileText,
  Trash2,
  Building,
  Info,
  Eye,
  MapPin,
  Map,
  Clipboard,
  Send,
  Save,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";
import { useState } from "react";
import { savePropertyInfo } from "@/services/projectService";

interface Document {
  id: string;
  name: string;
  size: string;
  date: string;
  icon: string;
  file?: File;
  url?: string;
}

interface FormData {
  title: string;
  address: string;
  ownerName: string;
  occupantName: string;
  propertyType: string;
  year: string;
  materials: string;
  geographicSector: string;
}

interface SwotAnalysis {
  strengths: string;
  weaknesses: string;
  opportunities: string;
  threats: string;
}

interface InformationsStepProps {
  projectId: number;
  formData: FormData;
  notes: string;
  swotAnalysis: SwotAnalysis;
  documents: Document[];
  onFormDataChange: (data: FormData) => void;
  onNotesChange: (notes: string) => void;
  onSwotChange: (swot: SwotAnalysis) => void;
  onDocumentsChange: (docs: Document[]) => void;
  onStepComplete: () => void;
  onOpenDocument?: (document: Document) => void;
}

export function InformationsStep({
  projectId,
  formData,
  notes,
  swotAnalysis,
  documents,
  onFormDataChange,
  onNotesChange,
  onSwotChange,
  onDocumentsChange,
  onStepComplete,
  onOpenDocument,
}: InformationsStepProps) {
  const [notesCopied, setNotesCopied] = useState(false);
  const [swotSaved, setSwotSaved] = useState(false);
  const [showOwnerInfo, setShowOwnerInfo] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleAddFileClick = () => {
    const fileInput = document.getElementById("file-upload") as HTMLInputElement;
    fileInput?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("Le fichier est trop volumineux. Taille maximale : 10MB");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("Type de fichier non supporté. Formats acceptés : PDF, JPG, PNG");
      return;
    }

    const newDocument: Document = {
      id: `${Date.now()}`,
      name: file.name,
      size: formatFileSize(file.size),
      date: new Date().toLocaleDateString("fr-FR"),
      icon: file.type === "application/pdf" ? "📄" : "🖼️",
      file: file,
      url: URL.createObjectURL(file),
    };

    onDocumentsChange([...documents, newDocument]);

    const fileInput = document.getElementById("file-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleDeleteDocument = (id: string) => {
    onDocumentsChange(documents.filter((doc) => doc.id !== id));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Le titre est obligatoire";
    if (!formData.address.trim()) newErrors.address = "L'adresse est obligatoire";
    if (!formData.ownerName.trim())
      newErrors.ownerName = "Le nom du propriétaire est obligatoire";
    if (!formData.propertyType)
      newErrors.propertyType = "Le type de bien est obligatoire";

    if (!formData.year) {
      newErrors.year = "L'année de construction est obligatoire";
    } else {
      const yearNum = parseInt(formData.year);
      const currentYear = new Date().getFullYear();
      if (yearNum < 1800 || yearNum > currentYear) {
        newErrors.year = `L'année doit être entre 1800 et ${currentYear}`;
      }
    }

    if (!formData.geographicSector.trim()) {
      newErrors.geographicSector = "Le secteur géographique est obligatoire";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsSaving(true);

    try {
      const propertyData = {
        owner_name: formData.ownerName,
        occupant_name: formData.occupantName,
        construction_year: formData.year ? parseInt(formData.year) : undefined,
        materials: formData.materials || undefined,
        geographic_sector: formData.geographicSector,
        swot_strengths: swotAnalysis.strengths || undefined,
        swot_weaknesses: swotAnalysis.weaknesses || undefined,
        swot_opportunities: swotAnalysis.opportunities || undefined,
        swot_threats: swotAnalysis.threats || undefined,
        notes: notes || undefined,
      };

      await savePropertyInfo(projectId, propertyData);

      onStepComplete();
      alert("Informations enregistrées avec succès !");
      setErrors({});
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert(error instanceof Error ? error.message : "Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyNotes = () => {
    navigator.clipboard.writeText(notes);
    setNotesCopied(true);
    setTimeout(() => setNotesCopied(false), 2000);
  };

  const handleSendToAI = () => {
    console.log("Notes envoyées à l'IA:", notes);
    alert("Notes envoyées à l'assistant IA !");
  };

  const handleSaveSwot = () => {
    console.log("Analyse SWOT sauvegardée:", swotAnalysis);
    setSwotSaved(true);
    setTimeout(() => setSwotSaved(false), 2000);
  };

  return (
    <div className="flex gap-6">
      {/* Colonne gauche - Documents (25%) */}
      <div className="w-1/4">
        <div className="bg-white rounded-lg border border-gray-200 p-6 h-full">
          <h3 className="text-lg text-gray-900 mb-4">Documents</h3>

          <input
            id="file-upload"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
            className="hidden"
          />

          <button
            onClick={handleAddFileClick}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-4"
          >
            <Plus className="w-5 h-5" />
            Ajouter un fichier
          </button>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4 hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              Glissez-déposez vos fichiers ici
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PDF, JPG, PNG (Max 10MB)
            </p>
          </div>

          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors group"
              >
                <FileText className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{doc.name}</p>
                  <p className="text-xs text-gray-500">
                    {doc.size} • {doc.date}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onOpenDocument?.(doc)}
                    className="px-2 py-1 border border-gray-300 rounded text-xs text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    Voir
                  </button>

                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4 text-red-600 hover:text-red-700" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Colonne droite - Formulaire (75%) */}
      <div className="flex-1">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="bg-blue-600 px-6 py-4 rounded-t-lg">
            <div className="flex items-center gap-3">
              <Building className="w-6 h-6 text-white" />
              <h3 className="text-lg text-white">Informations de l'immeuble</h3>
            </div>
          </div>

          <div className="p-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Titre */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Titre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    required
                    onChange={(e) => {
                      onFormDataChange({ ...formData, title: e.target.value });
                      if (errors.title) setErrors({ ...errors, title: "" });
                    }}
                    placeholder="Ex: Immeuble A"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.title ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                  )}
                </div>

                {/* Adresse */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Adresse <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    required
                    onChange={(e) => {
                      onFormDataChange({
                        ...formData,
                        address: e.target.value,
                      });
                      if (errors.address) setErrors({ ...errors, address: "" });
                    }}
                    placeholder="Ex: 123 Rue des Immeubles, 75001 Paris"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.address ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                {/* Nom du propriétaire */}
                <div className="relative">
                  <label className="block text-sm text-gray-700 mb-2 flex items-center gap-1">
                    Nom du propriétaire <span className="text-red-500">*</span>
                    <Info
                      className="w-4 h-4 text-blue-600 cursor-pointer"
                      onClick={() => setShowOwnerInfo(!showOwnerInfo)}
                    />
                  </label>

                  <input
                    type="text"
                    value={formData.ownerName}
                    required
                    onChange={(e) => {
                      onFormDataChange({
                        ...formData,
                        ownerName: e.target.value,
                      });
                      if (errors.ownerName)
                        setErrors({ ...errors, ownerName: "" });
                    }}
                    placeholder="Ex: Jean Dupont"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.ownerName ? "border-red-500" : "border-gray-300"
                    }`}
                  />

                  {errors.ownerName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.ownerName}
                    </p>
                  )}

                  {showOwnerInfo && (
                    <div className="absolute top-0 left-full ml-2 w-72 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                      <div className="absolute top-2 -left-2 w-0 h-0 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-white"></div>
                      <div className="p-4 space-y-1 text-sm text-gray-700">
                        <p>
                          <strong>Nom complet:</strong> Jean Dupont
                        </p>
                        <p>
                          <strong>Adresse :</strong> 123 Rue des Immeubles, 26000
                          Valence
                        </p>
                        <p>
                          <strong>Téléphone :</strong> +33 6 12 34 56 78
                        </p>
                        <p>
                          <strong>Email :</strong> jean.dupont@email.com
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Nom occupant */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Nom de l'occupant
                  </label>
                  <input
                    type="text"
                    value={formData.occupantName}
                    onChange={(e) =>
                      onFormDataChange({
                        ...formData,
                        occupantName: e.target.value,
                      })
                    }
                    placeholder="Ex: Société ABC"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Type de bien <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.propertyType}
                    required
                    onChange={(e) => {
                      onFormDataChange({
                        ...formData,
                        propertyType: e.target.value,
                      });
                      if (errors.propertyType)
                        setErrors({ ...errors, propertyType: "" });
                    }}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.propertyType ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Sélectionner</option>
                    <option value="bureaux">Bureau</option>
                    <option value="local_activite">Local d'activité</option>
                    <option value="local_commercial">Local commercial</option>
                    <option value="terrain">Terrain</option>
                  </select>
                  {errors.propertyType && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.propertyType}
                    </p>
                  )}
                </div>

                {/* Année */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Année de construction <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    required
                    min="1800"
                    max={new Date().getFullYear()}
                    onChange={(e) => {
                      onFormDataChange({ ...formData, year: e.target.value });
                      if (errors.year) setErrors({ ...errors, year: "" });
                    }}
                    placeholder="Ex: 1995"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.year ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.year && (
                    <p className="text-red-500 text-xs mt-1">{errors.year}</p>
                  )}
                </div>

                {/* Secteur */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Secteur géographique <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.geographicSector}
                    required
                    onChange={(e) => {
                      onFormDataChange({
                        ...formData,
                        geographicSector: e.target.value,
                      });
                      if (errors.geographicSector)
                        setErrors({ ...errors, geographicSector: "" });
                    }}
                    placeholder="Ex: Centre-ville, Zone industrielle"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.geographicSector ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.geographicSector && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.geographicSector}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Enregistrement..." : "Enregistrer les informations"}
              </button>
            </form>

            {/* Notes */}
            <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg text-gray-900 mb-3 flex items-center gap-2">
                📝 Notes
              </h3>

              <textarea
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="Ajoutez vos observations..."
                maxLength={500}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
              />

              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-500">
                  {notes.length}/500 caractères
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={handleCopyNotes}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center gap-2"
                  >
                    {notesCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copié !
                      </>
                    ) : (
                      <>
                        <Clipboard className="w-4 h-4" />
                        Copier
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleSendToAI}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Envoyer à l'IA
                  </button>
                </div>
              </div>
            </div>

            {/* Carte */}
            <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Map className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg text-gray-900">Localisation du bien</h3>
              </div>

              <div className="relative w-full h-[400px] bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src="https://arc-anglerfish-eu-central-1-prod-leparisien.s3.amazonaws.com/public/5UAWECLJVFOXQS6RPEGA3XXU3M.jpg"
                  alt="Carte"
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-white/10"></div>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <MapPin className="w-10 h-10 text-red-600 fill-red-600 drop-shadow-lg animate-bounce" />
                  <div className="mt-2 bg-white px-3 py-2 rounded-lg shadow-lg border-2 border-red-600">
                    <p className="text-sm font-semibold text-gray-900">
                      {formData.title || "Votre bien"}
                    </p>
                    <p className="text-xs text-gray-600">
                      {formData.address || "Adresse non renseignée"}
                    </p>
                  </div>
                </div>

                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <button className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors border border-gray-200">
                    <ZoomIn className="w-5 h-5 text-gray-700" />
                  </button>
                  <button className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors border border-gray-200">
                    <ZoomOut className="w-5 h-5 text-gray-700" />
                  </button>
                  <button className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors border border-gray-200">
                    <Maximize2 className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
              </div>
            </div>

            {/* SWOT */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 mt-6">
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                📊 Analyse SWOT du bien
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-base text-green-900 font-medium mb-2">
                    💪 FORCES
                  </h4>
                  <textarea
                    value={swotAnalysis.strengths}
                    onChange={(e) =>
                      onSwotChange({ ...swotAnalysis, strengths: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-green-300 rounded-lg resize-none"
                    rows={4}
                  />
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-base text-red-900 font-medium mb-2">
                    ⚠️ FAIBLESSES
                  </h4>
                  <textarea
                    value={swotAnalysis.weaknesses}
                    onChange={(e) =>
                      onSwotChange({ ...swotAnalysis, weaknesses: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-red-300 rounded-lg resize-none"
                    rows={4}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-base text-blue-900 font-medium mb-2">
                    🎯 OPPORTUNITÉS
                  </h4>
                  <textarea
                    value={swotAnalysis.opportunities}
                    onChange={(e) =>
                      onSwotChange({
                        ...swotAnalysis,
                        opportunities: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg resize-none"
                    rows={4}
                  />
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="text-base text-orange-900 font-medium mb-2">
                    ⚡ MENACES
                  </h4>
                  <textarea
                    value={swotAnalysis.threats}
                    onChange={(e) =>
                      onSwotChange({ ...swotAnalysis, threats: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-orange-300 rounded-lg resize-none"
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <button
                  onClick={handleSaveSwot}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  {swotSaved ? (
                    <>
                      <Check className="w-4 h-4" />
                      Sauvegardé !
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Sauvegarder l'analyse
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
