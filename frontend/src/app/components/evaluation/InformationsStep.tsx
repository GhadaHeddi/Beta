import {
  Plus,
  Upload,
  FileText,
  Trash2,
  Building,
  Info,
  Eye,
  Clipboard,
  Send,
  Save,
  Check,
  AlertTriangle,
  UserPlus,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { savePropertyInfo, uploadProjectFile, deleteProjectFile, getFileUrl, searchOwner, createOwner } from "@/services/projectService";
import type { OwnerRecord } from "@/services/projectService";
import { AddressMap } from "@/app/components/AddressMap";

interface Document {
  id: string;
  serverId?: number;
  name: string;
  size: string;
  date: string;
  icon: string;
  file?: File;
  url?: string;
  mimeType?: string;
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
  isAddressValidated: boolean;
  onAddressValidatedChange: (validated: boolean) => void;
  onFormDataChange: (data: FormData) => void;
  onNotesChange: (notes: string) => void;
  onSwotChange: (swot: SwotAnalysis) => void;
  onDocumentsChange: (docs: Document[]) => void;
  onStepComplete: () => void;
  onOpenDocument?: (document: Document) => void;
  onCoordinatesChange?: (lat: number, lng: number) => void;
  initialCoordinates?: { lat: number; lng: number };
}

export function InformationsStep({
  projectId,
  formData,
  notes,
  swotAnalysis,
  documents,
  isAddressValidated,
  onAddressValidatedChange,
  onFormDataChange,
  onNotesChange,
  onSwotChange,
  onDocumentsChange,
  onStepComplete,
  onOpenDocument,
  onCoordinatesChange,
  initialCoordinates,
}: InformationsStepProps) {
  const [notesCopied, setNotesCopied] = useState(false);
  const [swotSaved, setSwotSaved] = useState(false);
  const [showOwnerInfo, setShowOwnerInfo] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Propriétaire trouvé en base (via API)
  const [foundOwner, setFoundOwner] = useState<OwnerRecord | null>(null);

  // Formulaire nouveau proprietaire
  const [newOwnerForm, setNewOwnerForm] = useState({
    address: "",
    phone: "",
    email: "",
  });
  const [ownerSaved, setOwnerSaved] = useState(false);

  // Coordonnees confirmees (initialisees depuis les props si disponibles)
  const [confirmedCoords, setConfirmedCoords] = useState<{ lat: number; lng: number } | null>(
    initialCoordinates || null
  );

  // Ref pour le popover (click-outside)
  const ownerInfoRef = useRef<HTMLDivElement>(null);
  const infoIconRef = useRef<HTMLDivElement>(null);

  const handleSaveNewOwner = async () => {
    if (!formData.ownerName.trim()) return;
    if (!newOwnerForm.email.trim() && !newOwnerForm.phone.trim()) {
      alert("Veuillez renseigner au moins un email ou un telephone.");
      return;
    }
    try {
      const saved = await createOwner({
        name: formData.ownerName.trim(),
        address: newOwnerForm.address,
        phone: newOwnerForm.phone,
        email: newOwnerForm.email,
      });
      setFoundOwner(saved);
      setOwnerSaved(true);
      setTimeout(() => setOwnerSaved(false), 2000);
    } catch (error) {
      console.error("Erreur sauvegarde proprietaire:", error);
      alert("Erreur lors de la sauvegarde du proprietaire");
    }
  };

  // Recherche du propriétaire en base quand le nom change (insensible à la casse)
  useEffect(() => {
    const name = formData.ownerName.trim();
    if (!name) {
      setFoundOwner(null);
      return;
    }
    const timer = setTimeout(async () => {
      const owner = await searchOwner(name);
      setFoundOwner(owner);
      if (owner) {
        setNewOwnerForm({ address: "", phone: "", email: "" });
        setOwnerSaved(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [formData.ownerName]);

  // Fermer le popover quand on clique en dehors
  useEffect(() => {
    if (!showOwnerInfo) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        ownerInfoRef.current && !ownerInfoRef.current.contains(e.target as Node) &&
        infoIconRef.current && !infoIconRef.current.contains(e.target as Node)
      ) {
        setShowOwnerInfo(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showOwnerInfo]);

  // État pour la validation d'adresse
  const [isValidatingAddress, setIsValidatingAddress] = useState(!isAddressValidated && !initialCoordinates && !!formData.address);
  const [addressToValidate, setAddressToValidate] = useState(formData.address);

  // Refs pour le scroll
  const mapSectionRef = useRef<HTMLDivElement>(null);
  const addressFieldRef = useRef<HTMLInputElement>(null);
  const formTopRef = useRef<HTMLDivElement>(null);

  // Quand isAddressValidated passe a true depuis le parent (donnees chargees), desactiver la validation
  useEffect(() => {
    if (isAddressValidated) {
      setIsValidatingAddress(false);
    }
  }, [isAddressValidated]);

  // Mettre a jour confirmedCoords si initialCoordinates change (chargement async)
  useEffect(() => {
    if (initialCoordinates && !confirmedCoords) {
      setConfirmedCoords(initialCoordinates);
    }
  }, [initialCoordinates]);

  // Scroll vers la carte au chargement initial si l'adresse existe
  useEffect(() => {
    if (formData.address && !isAddressValidated && mapSectionRef.current) {
      // Petit délai pour laisser le composant se rendre
      const timer = setTimeout(() => {
        mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Fonction appelée quand l'utilisateur confirme l'adresse
  const handleConfirmAddress = (lat: number, lng: number) => {
    setConfirmedCoords({ lat, lng });
    onCoordinatesChange?.(lat, lng);
    onAddressValidatedChange(true);
    setIsValidatingAddress(false);
    // Scroll vers le haut du formulaire
    formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Fonction appelée quand l'utilisateur veut changer l'adresse
  const handleChangeAddress = () => {
    onAddressValidatedChange(false);
    setIsValidatingAddress(false);
    // Vider l'adresse actuelle
    onFormDataChange({ ...formData, address: '' });
    setAddressToValidate('');
    // Scroll vers le champ d'adresse et focus
    setTimeout(() => {
      addressFieldRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      addressFieldRef.current?.focus();
    }, 100);
  };

  // Fonction pour revalider une nouvelle adresse saisie
  const handleRevalidateAddress = () => {
    if (formData.address.trim()) {
      setAddressToValidate(formData.address);
      setIsValidatingAddress(true);
      // Scroll vers la carte
      setTimeout(() => {
        mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  // Fonction appelée quand l'utilisateur déplace le marqueur sur la carte
  const handleAddressUpdate = (newAddress: string) => {
    // Mettre à jour l'adresse dans le formulaire
    onFormDataChange({ ...formData, address: newAddress });
    setAddressToValidate(newAddress);
    // L'adresse n'est plus validée car elle a changé
    onAddressValidatedChange(false);
  };

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

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    try {
      // Upload vers le backend
      const uploaded = await uploadProjectFile(projectId, file);

      const newDocument: Document = {
        id: `${Date.now()}`,
        serverId: uploaded.id,
        name: uploaded.name,
        size: formatFileSize(uploaded.size),
        date: new Date().toLocaleDateString("fr-FR"),
        icon: file.type === "application/pdf" ? "📄" : "🖼️",
        file: file,
        url: getFileUrl(projectId, uploaded.id),
        mimeType: uploaded.mime_type,
      };

      onDocumentsChange([...documents, newDocument]);
    } catch (error) {
      console.error("Erreur upload:", error);
      alert("Erreur lors de l'upload du fichier");
    }

    const fileInput = document.getElementById("file-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleDeleteDocument = async (id: string) => {
    const doc = documents.find((d) => d.id === id);
    if (doc?.serverId) {
      try {
        await deleteProjectFile(projectId, doc.serverId);
        onDocumentsChange(documents.filter((d) => d.id !== id));
      } catch (error) {
        console.error("Erreur suppression:", error);
        alert("Erreur lors de la suppression du fichier");
      }
    } else {
      onDocumentsChange(documents.filter((d) => d.id !== id));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Le titre est obligatoire";
    if (!formData.address.trim()) newErrors.address = "L'adresse est obligatoire";
    if (!isAddressValidated) newErrors.address = "Veuillez valider l'adresse sur la carte";
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
      if (!isAddressValidated && formData.address) {
        // Scroll vers la carte si l'adresse n'est pas validée
        mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      alert("Veuillez remplir tous les champs obligatoires et valider l'adresse");
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
        latitude: confirmedCoords?.lat,
        longitude: confirmedCoords?.lng,
      };

      await savePropertyInfo(projectId, propertyData);

      onStepComplete();
      alert("Informations de l'immeuble enregistrées avec succès !");
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

  const handleSaveSwot = async () => {
    setSwotSaved(false);

    try {
      const swotData = {
        swot_strengths: swotAnalysis.strengths || undefined,
        swot_weaknesses: swotAnalysis.weaknesses || undefined,
        swot_opportunities: swotAnalysis.opportunities || undefined,
        swot_threats: swotAnalysis.threats || undefined,
        notes: notes || undefined,
      };

      await savePropertyInfo(projectId, swotData);

      setSwotSaved(true);
      setTimeout(() => setSwotSaved(false), 2000);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde SWOT:", error);
      alert(error instanceof Error ? error.message : "Erreur lors de la sauvegarde");
    }
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
        <div ref={formTopRef} className="bg-white rounded-lg border border-gray-200">
          <div className="bg-blue-600 px-6 py-4 rounded-t-lg">
            <div className="flex items-center gap-3">
              <Building className="w-6 h-6 text-white" />
              <h3 className="text-lg text-white">Informations de l'immeuble</h3>
            </div>
          </div>

          <div className="p-6">
            {/* Bandeau d'avertissement si adresse non validée */}
            {!isAddressValidated && formData.address && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-800 font-medium">Adresse non validée</p>
                  <p className="text-amber-700 text-sm mt-1">
                    Veuillez vérifier et confirmer l'adresse sur la carte ci-dessous avant de continuer.
                  </p>
                </div>
              </div>
            )}

            {/* Bandeau de succès si adresse validée */}
            {isAddressValidated && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-800 font-medium">Adresse confirmée</p>
                  <p className="text-green-700 text-sm mt-1">
                    L'adresse "{formData.address}" a été validée.
                  </p>
                </div>
              </div>
            )}

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
                    {isAddressValidated && (
                      <span className="ml-2 text-green-600 text-xs font-medium">✓ Validée</span>
                    )}
                  </label>
                  <div className="flex gap-2">
                    <input
                      ref={addressFieldRef}
                      type="text"
                      value={formData.address}
                      required
                      onChange={(e) => {
                        onFormDataChange({
                          ...formData,
                          address: e.target.value,
                        });
                        if (errors.address) setErrors({ ...errors, address: "" });
                        // Si l'adresse change après validation, invalider
                        if (isAddressValidated && e.target.value !== addressToValidate) {
                          onAddressValidatedChange(false);
                        }
                      }}
                      placeholder="Ex: 123 Rue des Immeubles, 75001 Paris"
                      className={`flex-1 px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.address ? "border-red-500 bg-red-50" :
                        !isAddressValidated && formData.address ? "border-amber-500 bg-amber-50" :
                        isAddressValidated ? "border-green-500 bg-green-50" :
                        "border-gray-300"
                      }`}
                    />
                    {!isAddressValidated && formData.address && !isValidatingAddress && (
                      <button
                        type="button"
                        onClick={handleRevalidateAddress}
                        className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
                      >
                        Vérifier
                      </button>
                    )}
                  </div>
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
                    <div ref={infoIconRef} className="relative inline-flex">
                      <Info
                        className="w-4 h-4 text-blue-600 cursor-pointer"
                        onClick={() => setShowOwnerInfo(!showOwnerInfo)}
                      />
                      {showOwnerInfo && (
                        <div ref={ownerInfoRef} className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white"></div>
                          {foundOwner ? (
                            <div className="p-4 space-y-2 text-sm text-gray-700">
                              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-700 font-semibold text-xs">
                                    {foundOwner.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">{foundOwner.name}</p>
                                  <p className="text-xs text-gray-500">{foundOwner.projects_count} projet(s) en base</p>
                                </div>
                              </div>
                              <p><strong>Adresse :</strong> {foundOwner.address}</p>
                              <p><strong>Telephone :</strong> {foundOwner.phone}</p>
                              <p><strong>Email :</strong> {foundOwner.email}</p>
                            </div>
                          ) : (
                            <div className="p-4 text-sm text-gray-600">
                              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                                  <UserPlus className="w-4 h-4 text-amber-700" />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">Nouveau proprietaire</p>
                                  <p className="text-xs text-gray-500">Remplissez sa fiche</p>
                                </div>
                              </div>
                              {formData.ownerName.trim() ? (
                                <div className="space-y-2 mt-2">
                                  <div>
                                    <label className="block text-xs text-gray-500 mb-1">Adresse</label>
                                    <input
                                      type="text"
                                      value={newOwnerForm.address}
                                      onChange={(e) => setNewOwnerForm({ ...newOwnerForm, address: e.target.value })}
                                      placeholder="Ex: 10 Rue de la Paix, 75002 Paris"
                                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-500 mb-1">Telephone</label>
                                    <input
                                      type="tel"
                                      value={newOwnerForm.phone}
                                      onChange={(e) => setNewOwnerForm({ ...newOwnerForm, phone: e.target.value })}
                                      placeholder="Ex: +33 6 00 00 00 00"
                                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-500 mb-1">Email</label>
                                    <input
                                      type="email"
                                      value={newOwnerForm.email}
                                      onChange={(e) => setNewOwnerForm({ ...newOwnerForm, email: e.target.value })}
                                      placeholder="Ex: contact@exemple.fr"
                                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={handleSaveNewOwner}
                                    className="w-full mt-2 px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                  >
                                    {ownerSaved ? (
                                      <>
                                        <Check className="w-4 h-4" />
                                        Enregistre !
                                      </>
                                    ) : (
                                      <>
                                        <Save className="w-4 h-4" />
                                        Enregistrer le proprietaire
                                      </>
                                    )}
                                  </button>
                                </div>
                              ) : (
                                <p className="text-gray-500">
                                  Saisissez un nom de proprietaire pour voir ses informations.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
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
                    <option value="office">Bureaux</option>
                    <option value="industrial">Locaux d'activité</option>
                    <option value="retail">Local commercial</option>
                    <option value="warehouse">Entrepôt</option>
                    <option value="land">Terrain</option>
                    <option value="mixed">Mixte</option>
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
                disabled={isSaving || !isAddressValidated}
                className={`w-full px-6 py-3 text-white rounded-lg transition-colors text-base font-medium disabled:cursor-not-allowed ${
                  isAddressValidated
                    ? "bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {isSaving ? "Enregistrement..." :
                 !isAddressValidated ? "Veuillez d'abord valider l'adresse" :
                 "Enregistrer les informations"}
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

            {/* Carte - Section de validation d'adresse */}
            <div ref={mapSectionRef} className="mt-6">
              {addressToValidate ? (
                <AddressMap
                  address={addressToValidate}
                  onConfirm={handleConfirmAddress}
                  onChangeAddress={handleChangeAddress}
                  onAddressUpdate={handleAddressUpdate}
                  isValidating={isValidatingAddress}
                  isConfirmed={isAddressValidated}
                />
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Building className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Aucune adresse à afficher
                    </h3>
                    <p className="text-gray-500 max-w-md">
                      Veuillez saisir une adresse dans le formulaire ci-dessus pour la visualiser sur la carte.
                    </p>
                  </div>
                </div>
              )}
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
