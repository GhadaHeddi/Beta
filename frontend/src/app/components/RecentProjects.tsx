import {
  Edit2,
  Share2,
  Building2,
  Factory,
  Store,
  TreePine,
  Filter,
} from "lucide-react";
import { useState } from "react";

interface Project {
  id: string;
  name: string;
  type:
    | "bureaux"
    | "local_commercial"
    | "local_activite"
    | "terrain";
  address: string;
  surface: string;
  nomOccupant: String;
  anneeconstruction: number;
  siret: String;
  rent?: string; // Loyer en €/m²
  salePrice?: string; // Prix de vente
  status: "En cours" | "Terminé" | "Brouillon";
  progress: number; // Pourcentage d'avancement
}

const mockProjects: Project[] = [
  {
    id: "1",
    name: "Bureaux Charles de Gaulle",
    type: "bureaux",
    address: "15 Avenue Charles de Gaulle, 92200 Neuilly",
    surface: "500",
    nomOccupant: "Michel François",
    siret: "351745724",
    anneeconstruction: 2025,
    rent: "180",
    salePrice: "7000",
    status: "Terminé",
    progress: 100,
  },
  {
    id: "2",
    name: "Commerce Rivoli",
    type: "local_commercial",
    address: "28 Rue de Rivoli, 75001 Paris",
    surface: "450",
    nomOccupant: "Frank Denis",
    siret: "351745724",
    anneeconstruction: 1990,
    rent: "350",
    salePrice: "6500",
    status: "Brouillon",
    progress: 0,
  },
  {
    id: "3",
    name: "Entrepôt Montreuil",
    type: "local_activite",
    address: "42 Zone Industrielle Nord, 93100 Montreuil",
    surface: "500",
    nomOccupant: "Michel François",
    siret: "351745724",
    anneeconstruction: 2025,
    rent: "85",
    salePrice: "5500",
    status: "En cours",
    progress: 65,
  },
  {
    id: "4",
    name: "Terrain Haussmann",
    type: "terrain",
    address: "5 Boulevard Haussmann, 75009 Paris",
    surface: "200",
    nomOccupant: "Frank Denis",
    siret: "351745724",
    anneeconstruction: 2017,
    salePrice: "5700",
    status: "En cours",
    progress: 58,
  },
  {
    id: "5",
    name: "Local Champs-Élysées",
    type: "local_activite",
    address: "33 Avenue des Champs-Élysées, 75008 Paris",
    surface: "800",
    nomOccupant: "Michel François",
    siret: "351745724",
    anneeconstruction: 2015,
    rent: "220",
    salePrice: "4800",
    status: "En cours",
    progress: 15,
  },
  {
    id: "6",
    name: "Entrepôt Longjumeau",
    type: "local_activite",
    address: "12 Route Nationale 7, 91160 Longjumeau",
    surface: "600",
    nomOccupant: "Hugo Despommes",
    siret: "351745724",
    anneeconstruction: 2022,
    rent: "95",
    salePrice: "7500",
    status: "En cours",
    progress: 78,
  },
];

const statusColors = {
  "En cours": "bg-blue-100 text-blue-800",
  Terminé: "bg-green-100 text-green-800",
  Brouillon: "bg-gray-100 text-gray-800",
};

const tauxcompletion = 48;

const completionstatus = "En cours";

const propertyTypeConfig = {
  bureaux: { icon: Building2, label: "Bureaux", emoji: "🏢" },
  local_activite: {
    icon: Factory,
    label: "Locaux d'activité",
    emoji: "🏭",
  },
  local_commercial: {
    icon: Store,
    label: "Local commercial",
    emoji: "🏪",
  },
  terrain: { icon: TreePine, label: "Terrain", emoji: "🌳" },
};

export function RecentProjects() {
  const [progressFilter, setProgressFilter] = useState<"all" | "0-50" | "50-75" | "75-99" | "completed">("all");

  // Filtrer les projets en fonction du filtre de progression
  const filteredProjects = mockProjects.filter((project) => {
    if (progressFilter === "all") return true;
    if (progressFilter === "0-50") return project.progress >= 0 && project.progress <= 50;
    if (progressFilter === "50-75") return project.progress > 50 && project.progress <= 75;
    if (progressFilter === "75-99") return project.progress > 75 && project.progress < 100;
    if (progressFilter === "completed") return project.progress === 100;
    return true;
  });

  return (
    <div className="bg-white px-8 py-8">
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl text-blue-900">
            Mes avis de valeur récents
          </h2>

          <div className="flex items-center gap-4">
            {/* Filtres de progression */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <button
                onClick={() => setProgressFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  progressFilter === "all"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setProgressFilter("0-50")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  progressFilter === "0-50"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                0-50%
              </button>
              <button
                onClick={() => setProgressFilter("50-75")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  progressFilter === "50-75"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                50-75%
              </button>
              <button
                onClick={() => setProgressFilter("75-99")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  progressFilter === "75-99"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                75-99%
              </button>
              <button
                onClick={() => setProgressFilter("completed")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  progressFilter === "completed"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Terminés
              </button>
            </div>

            {/* Badge de complétion totale */}
            <span
              className={`inline-block px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                statusColors[completionstatus]
              }`}
            >
              Complétion totale : {tauxcompletion}%
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 h-[50vh] overflow-y-auto">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10 bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="text-center px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                    Responsable du projet
                  </th>
                  <th className="text-center px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                    Statut
                  </th>
                  <th className="text-center px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                    Titre 
                  </th>
                  <th className="text-center px-10 py-4 text-sm text-gray-700 whitespace-nowrap">
                    Adresse
                  </th>
                  <th className="text-center px-8 py-4 text-sm text-gray-700 whitespace-nowrap">
                    Occupant actuel
                    <br />
                    (nom et Siret)
                  </th>
                  <th className="text-center px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                    Surface (m²)
                  </th>
                  <th className="text-center px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                    Loyer de marché <br />
                    (€/m²/an)
                  </th>
                  <th className="text-center px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                    Prix vente estimé <br />
                    (€/m²)
                  </th>
                  <th className="text-center px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                    année <br />
                    de construction
                  </th>
                  <th className="text-center px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project, index) => {
                  const typeConfig =
                    propertyTypeConfig[project.type];

                  return (
                    <tr
                      key={project.id}
                      className={`border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors ${
                        index % 2 === 1
                          ? "bg-gray-50"
                          : "bg-white"
                      }`}
                    >
                      <td className="px-6 py-4 text-blue-900 whitespace-nowrap">
                        {project.name}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                            statusColors[project.status]
                          }`}
                        >
                          {project.progress}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-gray-700">
                          <span className="text-lg">
                            {typeConfig.emoji}
                          </span>
                          <span>{project.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {project.address}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {project.nomOccupant}
                        <br />
                        {project.siret}
                      </td>
                      <td className="px-6 py-4 text-gray-700 text-center whitespace-nowrap">
                        {project.surface}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-700 whitespace-nowrap">
                        {project.rent ? (
                          `${project.rent} €/m²`
                        ) : (
                          <span className="text-gray-400">
                            -
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-blue-900 font-semibold whitespace-nowrap">
                        {project.salePrice ? (
                          `${project.salePrice} €`
                        ) : (
                          <span className="text-gray-400 font-normal">
                            -
                          </span>
                        )}
                      </td>
                      <td className="px-6 text-center py-4 text-gray-700 whitespace-nowrap">
                        {project.anneeconstruction}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4 text-gray-600" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Share2 className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}