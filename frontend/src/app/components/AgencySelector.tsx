import { useState, useEffect } from "react";
import { Building2, ChevronDown } from "lucide-react";
import { getAllAgencies } from "@/services/agencyService";
import type { Agency } from "@/types/project";

interface AgencySelectorProps {
  selectedAgencyId: number | null;
  onAgencyChange: (agencyId: number | null) => void;
}

export function AgencySelector({ selectedAgencyId, onAgencyChange }: AgencySelectorProps) {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllAgencies()
      .then(setAgencies)
      .catch(() => setAgencies([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading || agencies.length === 0) return null;

  const selectedAgency = agencies.find(a => a.id === selectedAgencyId);

  return (
    <div className="relative inline-flex items-center gap-2">
      <Building2 className="w-4 h-4 text-gray-500" />
      <select
        value={selectedAgencyId ?? ""}
        onChange={(e) => {
          const val = e.target.value;
          onAgencyChange(val === "" ? null : Number(val));
        }}
        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
      >
        <option value="">Toutes les agences</option>
        {agencies.map((agency) => (
          <option key={agency.id} value={agency.id}>
            {agency.name}{agency.city ? ` - ${agency.city}` : ""}
          </option>
        ))}
      </select>
      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}
