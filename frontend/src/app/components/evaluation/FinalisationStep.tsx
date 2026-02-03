import {
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Shield,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Printer,
  Download,
  MoreVertical,
  ChevronDown,
  Settings,
} from "lucide-react";
import { useState } from "react";

export function FinalisationStep() {
  const estimatedPrice = "1 200 000 €";
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [documentGenerated, setDocumentGenerated] =
    useState(true); // false pour l'état vide
  const totalPages = 8;

  return (
    <div className="space-y-6">
      {/* Grille des indicateurs financiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-full">
        {/* Loyer de marché */}
        <label className="relative cursor-pointer">
          <input
            type="checkbox"
            defaultChecked
            className="peer hidden"
          />

          <div
            className="
        bg-white rounded-lg border border-gray-200 p-6
        transition
        peer-checked:border-blue-500
        peer-checked:bg-blue-50
        peer-checked:ring-2 peer-checked:ring-blue-200
      "
          >
            <p className="text-sm text-gray-600 mb-1">
              Loyer de marché estimé
            </p>
            <p className="text-3xl font-bold text-blue-900">
              780 € / m² / an
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Basé sur des biens comparables
            </p>
          </div>
        </label>

        {/* Prix de vente */}
        <label className="relative cursor-pointer">
          <input
            type="checkbox"
            defaultChecked
            className="peer hidden"
          />

          <div
            className="
        bg-white rounded-lg border border-gray-200 p-6
        transition
        peer-checked:border-blue-500
        peer-checked:bg-blue-50
        peer-checked:ring-2 peer-checked:ring-blue-200
      "
          >
            <p className="text-sm text-gray-600 mb-1">
              Prix de vente estimé
            </p>
            <p className="text-3xl font-bold text-blue-900">
              3 950 € / m²
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Transactions récentes comparables
            </p>
          </div>
        </label>

        {/* Financement */}
        <label className="relative cursor-pointer">
          <input type="checkbox" className="peer hidden" />

          <div
            className="
        bg-white rounded-lg border border-gray-200 p-6
        transition
        peer-checked:border-green-500
        peer-checked:bg-green-50
        peer-checked:ring-2 peer-checked:ring-green-200
      "
          >
            <p className="text-sm text-gray-600 mb-1">
              Financement estimé
            </p>
            <p className="text-3xl font-bold text-green-700">
              1 200 000 €
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Montant à financer
            </p>
          </div>
        </label>

        {/* Rendement locatif */}
        <label className="relative cursor-pointer">
          <input
            type="checkbox"
            defaultChecked
            className="peer hidden"
          />

          <div
            className="
        bg-white rounded-lg border border-gray-200 p-6
        transition
        peer-checked:border-green-500
        peer-checked:bg-green-50
        peer-checked:ring-2 peer-checked:ring-green-200
      "
          >
            <p className="text-sm text-gray-600 mb-1">
              Rendement locatif estimé
            </p>
            <p className="text-4xl font-bold text-green-700">
              8,2 %
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Rendement annuel brut
            </p>
          </div>
        </label>
      </div>

      {/* Aperçu du document généré */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl text-gray-900 mb-6">
          Aperçu du document généré
        </h3>

        {!documentGenerated ? (
          // État vide
          <div className="py-16 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Download className="w-12 h-12 text-gray-400" />
            </div>
            <h4 className="text-xl text-gray-900 mb-2">
              L'avis de valeur n'a pas encore été généré
            </h4>
            <p className="text-gray-500 mb-6">
              Cliquez sur le bouton ci-dessous pour générer le
              document
            </p>
            <button
              onClick={() => setDocumentGenerated(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              🚀 Générer l'avis de valeur
            </button>
          </div>
        ) : (
          <>
            {/* Contrôles de visualisation */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 flex items-center justify-between">
              {/* Navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage(Math.max(1, currentPage - 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm text-gray-700">
                  Page {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage(
                      Math.min(totalPages, currentPage + 1),
                    )
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Zoom */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setZoom(Math.max(50, zoom - 25))
                  }
                  className="p-2 border border-gray-300 rounded hover:bg-white transition-colors"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <select
                  value={zoom}
                  onChange={(e) =>
                    setZoom(Number(e.target.value))
                  }
                  className="px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="50">50%</option>
                  <option value="75">75%</option>
                  <option value="100">100%</option>
                  <option value="125">125%</option>
                  <option value="150">150%</option>
                  <option value="200">200%</option>
                </select>
                <button
                  onClick={() =>
                    setZoom(Math.min(200, zoom + 25))
                  }
                  className="p-2 border border-gray-300 rounded hover:bg-white transition-colors"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoom(100)}
                  className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-white transition-colors flex items-center gap-1"
                >
                  <Maximize2 className="w-3 h-3" />
                  Adapter à l'écran
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-white transition-colors flex items-center gap-2">
                  <Printer className="w-4 h-4" />
                  Imprimer
                </button>

                <div className="relative">
                  <button
                    onClick={() =>
                      setIsDownloadOpen(!isDownloadOpen)
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {isDownloadOpen && (
                    <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[220px] z-10">
                      <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors">
                        Télécharger en PDF
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors">
                        Télécharger en PowerPoint (.pptx)
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors">
                        Télécharger en Word (.docx)
                      </button>
                    </div>
                  )}
                </div>

                <button className="p-2 border border-gray-300 rounded hover:bg-white transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Zone de prévisualisation avec thumbnails */}
            <div className="flex gap-4">
              {/* Prévisualisation principale (70%) */}
              <div className="flex-1">
                <div className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
                  <div
                    className="bg-gray-100 flex items-center justify-center p-8"
                    style={{
                      transform: `scale(${zoom / 100})`,
                      transformOrigin: "top center",
                      transition: "transform 0.2s",
                    }}
                  >
                    <div
                      className="bg-white shadow-xl"
                      style={{
                        width: "800px",
                        aspectRatio: "16/9",
                      }}
                    >
                      <div className="p-8 h-full flex flex-col">
                        <h3 className="text-2xl text-blue-900 mb-4">
                          Avis de Valeur Immobilière
                        </h3>
                        <div className="flex-1 flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-6xl text-blue-900 mb-4">
                              {estimatedPrice}
                            </p>
                            <p className="text-gray-600">
                              Page {currentPage} / {totalPages}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 text-right">
                          Oryem - Expertise Immobilière
                          Professionnelle
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Barre latérale de thumbnails (30%) */}
              <div className="w-[240px]">
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 max-h-[600px] overflow-y-auto">
                  <h4 className="text-sm text-gray-700 mb-3 font-medium">
                    Miniatures
                  </h4>
                  <div className="space-y-2">
                    {Array.from(
                      { length: totalPages },
                      (_, i) => i + 1,
                    ).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-full aspect-[16/10] border-2 rounded overflow-hidden transition-all hover:shadow-lg hover:scale-105 relative ${
                          currentPage === page
                            ? "border-blue-600 bg-blue-50 shadow-md"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <div className="absolute top-1 right-1 bg-gray-900 text-white text-xs px-1.5 py-0.5 rounded">
                          {page}
                        </div>
                        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
                          <span className="text-xs text-gray-500">
                            Page {page}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Paramètres du document (collapsible) */}
            <div className="mt-6 border border-gray-200 rounded-lg">
              <button
                onClick={() =>
                  setIsSettingsOpen(!isSettingsOpen)
                }
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-600" />
                  <span className="text-base text-gray-900 font-medium">
                    ⚙️ Paramètres du document
                  </span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-600 transition-transform ${isSettingsOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isSettingsOpen && (
                <div className="px-6 pb-6 pt-2 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Format d'export
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="format"
                            value="pdf"
                            defaultChecked
                            className="text-blue-600"
                          />
                          <span className="text-sm text-gray-700">
                            PDF
                          </span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="format"
                            value="pptx"
                            className="text-blue-600"
                          />
                          <span className="text-sm text-gray-700">
                            PowerPoint
                          </span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="format"
                            value="docx"
                            className="text-blue-600"
                          />
                          <span className="text-sm text-gray-700">
                            Word
                          </span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Qualité
                      </label>
                      <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg">
                        <option>Standard</option>
                        <option>Haute qualité</option>
                        <option>Impression</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Options
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="text-blue-600"
                          />
                          <span className="text-sm text-gray-700">
                            Inclure les annexes
                          </span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="text-blue-600"
                          />
                          <span className="text-sm text-gray-700">
                            Ajouter un filigrane
                          </span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Langue du document
                      </label>
                      <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg">
                        <option>Français</option>
                        <option>Anglais</option>
                      </select>
                    </div>
                  </div>

                  <button className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Appliquer les modifications
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}