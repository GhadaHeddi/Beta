import { FileText } from "lucide-react";

interface DocumentViewerProps {
  documentName: string;
  documentIcon: string;
}

export function DocumentViewer({ documentName, documentIcon }: DocumentViewerProps) {
  return (
    <div className="h-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-32 h-32 mx-auto mb-6 bg-white rounded-lg border-2 border-gray-200 flex items-center justify-center">
          <span className="text-6xl">{documentIcon}</span>
        </div>
        <h3 className="text-2xl text-gray-900 mb-2">{documentName}</h3>
        <p className="text-gray-500 mb-6">
          Aperçu du document
        </p>
        <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-3xl mx-auto shadow-sm">
          <div className="aspect-[4/3] bg-gray-100 rounded border border-gray-300 flex items-center justify-center">
            <FileText className="w-24 h-24 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Simulation de l'aperçu du document
          </p>
        </div>
      </div>
    </div>
  );
}
