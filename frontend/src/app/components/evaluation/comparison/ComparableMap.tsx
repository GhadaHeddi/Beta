import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { ComparablePool, MapCenter } from '@/types/comparable';
import { ComparableMapLegend } from './ComparableMapLegend';

// Fix for default marker icons in Leaflet with Vite
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

/**
 * Cree une icone personnalisee avec le prix affiche
 */
const createPriceIcon = (price: number, color: string, selected: boolean) => {
  const borderWidth = selected ? '3px' : '2px';
  const shadow = selected ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.2)';
  const formattedPrice = Math.round(price).toLocaleString('fr-FR');

  return L.divIcon({
    className: '',
    html: `
      <div style="
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        background: #ffffff;
        border: ${borderWidth} solid ${color};
        border-radius: 8px;
        padding: 4px 8px;
        font-size: 12px;
        font-weight: 600;
        color: #1f2937;
        white-space: nowrap;
        box-shadow: ${shadow};
        cursor: pointer;
        line-height: 1.4;
      ">
        ${formattedPrice} <span style="font-size:10px;font-weight:400;color:#6b7280;">EUR/m\u00B2</span>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

/**
 * Icone pour le bien evalue (rouge, plus grande)
 */
const evaluatedPropertyIcon = L.divIcon({
  className: '',
  html: `
    <div style="
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 28px;
      height: 28px;
      background: #EF4444;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
    "></div>
  `,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});

/**
 * Composant pour ajuster la vue de la carte quand le centre change
 */
function MapUpdater({ center, distanceKm }: { center: MapCenter; distanceKm: number }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      // Ajuster le zoom en fonction de la distance
      let zoom = 13;
      if (distanceKm <= 1) zoom = 15;
      else if (distanceKm <= 3) zoom = 14;
      else if (distanceKm <= 5) zoom = 13;
      else if (distanceKm <= 10) zoom = 12;
      else zoom = 11;

      map.setView([center.lat, center.lng], zoom);
    }
  }, [center, distanceKm, map]);

  return null;
}

interface Props {
  center: MapCenter | null;
  comparables: ComparablePool[];
  selectedIds: number[];
  distanceKm: number;
  onMarkerClick: (comparable: ComparablePool) => void;
}

export function ComparableMap({
  center,
  comparables,
  selectedIds,
  distanceKm,
  onMarkerClick
}: Props) {
  // Position par defaut (Paris) si pas de centre
  const defaultCenter: MapCenter = { lat: 48.8566, lng: 2.3522 };
  const mapCenter = center || defaultCenter;

  if (!center) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        <div className="h-[400px] flex items-center justify-center bg-gray-100">
          <p className="text-gray-500">
            Les coordonnees du bien evalue ne sont pas disponibles.
            <br />
            Veuillez renseigner l'adresse dans l'etape Informations.
          </p>
        </div>
        <ComparableMapLegend />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6 relative z-0">
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={13}
        style={{ height: '400px', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater center={mapCenter} distanceKm={distanceKm} />

        {/* Marqueur du bien evalue (rouge) */}
        <Marker
          position={[mapCenter.lat, mapCenter.lng]}
          icon={evaluatedPropertyIcon}
        >
          <Popup>
            <div className="text-sm font-medium">Bien evalue</div>
          </Popup>
        </Marker>

        {/* Marqueurs des comparables */}
        {comparables.map((comparable) => {
          const isSelected = selectedIds.includes(comparable.id);
          const color = comparable.source === 'arthur_loyd' ? '#3B82F6' : '#F97316';

          return (
            <Marker
              key={comparable.id}
              position={[comparable.latitude, comparable.longitude]}
              icon={createPriceIcon(comparable.price_per_m2, color, isSelected)}
              eventHandlers={{
                click: () => onMarkerClick(comparable),
              }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-medium mb-1">{comparable.address}</p>
                  <p className="text-gray-600">
                    {comparable.surface} m2 - {comparable.price_per_m2.toLocaleString('fr-FR')} EUR/m2
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {comparable.transaction_date
                      ? new Date(comparable.transaction_date).toLocaleDateString('fr-FR')
                      : 'Date inconnue'}
                  </p>
                  {comparable.distance_km !== undefined && (
                    <p className="text-gray-500 text-xs">
                      Distance: {comparable.distance_km} km
                    </p>
                  )}
                  <p className="text-xs mt-1">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-white ${
                        comparable.source === 'arthur_loyd' ? 'bg-blue-500' : 'bg-orange-500'
                      }`}
                    >
                      {comparable.source === 'arthur_loyd' ? 'Arthur Loyd' : 'Concurrence'}
                    </span>
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <ComparableMapLegend />
    </div>
  );
}
