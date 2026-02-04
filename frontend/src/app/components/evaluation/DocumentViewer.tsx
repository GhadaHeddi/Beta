import { FileText, Download, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { useState } from "react";

interface DocumentViewerProps {
  documentName: string;
  documentIcon: string;
  fileUrl?: string;
  fileType?: string;
}

export function DocumentViewer({
  documentName,
  documentIcon,
  fileUrl,
  fileType
}: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handleDownload = () => {
    if (fileUrl) {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = documentName;
      link.click();
    }
  };

  const isImage = fileType?.startsWith("image/");
  const isPdf = fileType === "application/pdf";

  // Si pas de fichier, afficher le placeholder
  if (!fileUrl) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-6 bg-white rounded-lg border-2 border-gray-200 flex items-center justify-center">
            <span className="text-6xl">{documentIcon}</span>
          </div>
          <h3 className="text-2xl text-gray-900 mb-2">{documentName}</h3>
          <p className="text-gray-500 mb-6">Aperçu du document</p>
          <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-3xl mx-auto shadow-sm">
            <div className="aspect-[4/3] bg-gray-100 rounded border border-gray-300 flex items-center justify-center">
              <FileText className="w-24 h-24 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Aucun aperçu disponible
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Barre d'outils */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{documentIcon}</span>
          <div>
            <h3 className="text-lg font-medium text-gray-900">{documentName}</h3>
            <p className="text-sm text-gray-500">
              {isImage ? "Image" : isPdf ? "Document PDF" : "Document"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isImage && (
            <>
              <button
                onClick={handleZoomOut}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Zoom arrière"
              >
                <ZoomOut className="w-5 h-5 text-gray-600" />
              </button>
              <span className="text-sm text-gray-600 min-w-[50px] text-center">
                {zoom}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Zoom avant"
              >
                <ZoomIn className="w-5 h-5 text-gray-600" />
              </button>
              <div className="w-px h-6 bg-gray-300 mx-2" />
              <button
                onClick={handleRotate}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Rotation"
              >
                <RotateCw className="w-5 h-5 text-gray-600" />
              </button>
            </>
          )}
          <div className="w-px h-6 bg-gray-300 mx-2" />
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Télécharger
          </button>
        </div>
      </div>

      {/* Zone d'affichage */}
      <div className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-center min-h-full">
          {isImage ? (
            <div
              className="bg-white rounded-lg shadow-lg p-4 inline-block"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: "center center",
                transition: "transform 0.2s ease-out",
              }}
            >
              <img
                src={fileUrl}
                alt={documentName}
                className="max-w-full max-h-[70vh] object-contain rounded"
              />
            </div>
          ) : isPdf ? (
            <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
              <iframe
                src={fileUrl}
                title={documentName}
                className="w-full h-[75vh]"
              />
            </div>
          ) : (
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-6 bg-white rounded-lg border-2 border-gray-200 flex items-center justify-center">
                <span className="text-6xl">{documentIcon}</span>
              </div>
              <h3 className="text-xl text-gray-900 mb-2">{documentName}</h3>
              <p className="text-gray-500">
                Ce type de fichier ne peut pas être prévisualisé
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
