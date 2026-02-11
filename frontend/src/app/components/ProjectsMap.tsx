import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Loader2 } from 'lucide-react';
import { getProjectsWithFilters } from '@/services/projectService';
import type { Project } from '@/types/project';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Vite
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const statusColors: Record<string, string> = {
  draft: '#9CA3AF',
  in_progress: '#3B82F6',
  completed: '#10B981',
  archived: '#6B7280',
};

const statusLabels: Record<string, string> = {
  draft: 'Brouillon',
  in_progress: 'En cours',
  completed: 'Termine',
  archived: 'Archive',
};

const propertyTypeLabels: Record<string, string> = {
  office: 'Bureaux',
  warehouse: 'Entrepot',
  retail: 'Commerce',
  industrial: 'Activite',
  land: 'Terrain',
  mixed: 'Mixte',
};

function createProjectIcon(status: string) {
  const color = statusColors[status] || '#3B82F6';
  return L.divIcon({
    className: '',
    html: `
      <div style="
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 16px;
        height: 16px;
        background: ${color};
        border: 2.5px solid white;
        border-radius: 50%;
        box-shadow: 0 1px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

/** Ajuste la vue pour englober tous les marqueurs */
function MapFitBounds({ projects }: { projects: Project[] }) {
  const map = useMap();

  useEffect(() => {
    const points = projects
      .filter((p) => p.property_info?.latitude && p.property_info?.longitude)
      .map((p) => [p.property_info!.latitude!, p.property_info!.longitude!] as [number, number]);

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
    }
  }, [projects, map]);

  return null;
}

interface ProjectsMapProps {
  onProjectClick?: (project: Project) => void;
}

export function ProjectsMap({ onProjectClick }: ProjectsMapProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getProjectsWithFilters(
          {},
          { sortBy: 'updated_at', sortOrder: 'desc' },
          { page: 1, pageSize: 100 },
        );
        setProjects(data.projects);
      } catch (err) {
        console.error('Erreur chargement projets carte:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const geoProjects = useMemo(
    () => projects.filter((p) => p.property_info?.latitude && p.property_info?.longitude),
    [projects],
  );

  // Centre par defaut (France)
  const defaultCenter: [number, number] = [46.6, 2.5];

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
      </div>
    );
  }

  if (geoProjects.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100 px-4">
        <p className="text-sm text-gray-500 text-center">
          Aucun projet geolocalisé
        </p>
      </div>
    );
  }

  return (
    <div className="h-full relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapFitBounds projects={geoProjects} />

        {geoProjects.map((project) => (
          <Marker
            key={project.id}
            position={[project.property_info!.latitude!, project.property_info!.longitude!]}
            icon={createProjectIcon(project.status)}
            eventHandlers={{
              click: () => onProjectClick?.(project),
            }}
          >
            <Popup>
              <div className="text-xs min-w-[160px]">
                <p className="font-semibold text-gray-900 mb-1">{project.title}</p>
                <p className="text-gray-600 mb-1.5">{project.address}</p>
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block px-1.5 py-0.5 rounded text-white text-[10px]"
                    style={{ background: statusColors[project.status] }}
                  >
                    {statusLabels[project.status] || project.status}
                  </span>
                  <span className="text-gray-500">
                    {propertyTypeLabels[project.property_type] || project.property_type}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legende */}
      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-md px-2.5 py-1.5 shadow-sm z-[1000]">
        <div className="flex items-center gap-3 text-[10px] text-gray-600">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
            En cours
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            Termine
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block"></span>
            Brouillon
          </span>
        </div>
      </div>

      {/* Compteur */}
      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-md px-2.5 py-1 shadow-sm z-[1000]">
        <span className="text-[10px] text-gray-600 font-medium">
          {geoProjects.length} avis
        </span>
      </div>
    </div>
  );
}
