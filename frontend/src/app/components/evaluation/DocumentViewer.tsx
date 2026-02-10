import { FileText, Download } from "lucide-react";

interface DocumentViewerProps {
  documentName: string;
  documentIcon: string;
  documentUrl?: string;
  documentMimeType?: string;
}

export function DocumentViewer({ documentName, documentIcon, documentUrl, documentMimeType }: DocumentViewerProps) {
  // Si pas d'URL, afficher le placeholder
  if (!documentUrl) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-6 bg-white rounded-lg border-2 border-gray-200 flex items-center justify-center">
            <span className="text-6xl">{documentIcon}</span>
          </div>
          <h3 className="text-2xl text-gray-900 mb-2">{documentName}</h3>
          <p className="text-gray-500">Aucun aperçu disponible</p>
        </div>
      </div>
    );
  }

  const isImage = documentMimeType?.startsWith("image/");
  const isPdf = documentMimeType === "application/pdf";

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header avec nom du fichier et bouton télécharger */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{documentIcon}</span>
          <h3 className="text-lg font-medium text-gray-900">{documentName}</h3>
        </div>
        <a
          href={documentUrl}
          download={documentName}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Download className="w-4 h-4" />
          Télécharger
        </a>
      </div>

      {/* Contenu du fichier */}
      <div className="flex-1 p-6 overflow-auto">
        {isImage && (
          <div className="flex items-center justify-center h-full">
            <img
              src={documentUrl}
              alt={documentName}
              className="max-w-full max-h-full object-contain rounded-lg shadow-sm border border-gray-200"
            />
          </div>
        )}

        {isPdf && (
          <iframe
            src={documentUrl}
            title={documentName}
            className="w-full h-full rounded-lg border border-gray-200"
            style={{ minHeight: "600px" }}
          />
        )}

        {!isImage && !isPdf && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FileText className="w-24 h-24 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                Aperçu non disponible pour ce type de fichier
              </p>
              <a
                href={documentUrl}
                download={documentName}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Télécharger le fichier
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
