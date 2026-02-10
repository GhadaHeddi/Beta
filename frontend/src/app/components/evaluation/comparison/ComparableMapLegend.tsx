export function ComparableMapLegend() {
  return (
    <div className="flex items-center justify-center gap-6 py-3 border-t border-gray-200 bg-gray-50">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow"></div>
        <span className="text-sm text-gray-700">Bien evalue</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-blue-500"></div>
        <span className="text-sm text-gray-700">Arthur Loyd</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-orange-500"></div>
        <span className="text-sm text-gray-700">Concurrence</span>
      </div>
    </div>
  );
}
