export function ComparableMapLegend() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 py-3 px-4 border-t border-gray-200 bg-gray-50">
      {/* Bien evalue */}
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        </div>
        <span className="text-sm text-gray-700">Bien evalue</span>
      </div>

      {/* Arthur Loyd + Transaction */}
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-red-500 border-2 border-gray-800"></div>
        <span className="text-sm text-gray-700">Arthur Loyd - Transaction</span>
      </div>

      {/* Arthur Loyd + Disponible */}
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-red-500 border-2 border-green-500"></div>
        <span className="text-sm text-gray-700">Arthur Loyd - Disponible</span>
      </div>

      {/* Concurrence + Transaction */}
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-violet-700 border-2 border-gray-800"></div>
        <span className="text-sm text-gray-700">Concurrence - Transaction</span>
      </div>

      {/* Concurrence + Disponible */}
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-violet-700 border-2 border-green-500"></div>
        <span className="text-sm text-gray-700">Concurrence - Disponible</span>
      </div>
    </div>
  );
}
