import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@changey/react-leaflet-markercluster/dist/styles.min.css';
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
 * Couleurs de fond selon la source
 */
const SOURCE_COLORS: Record<string, string> = {
  arthur_loyd: '#EF4444', // Rouge
  concurrence: '#6D28D9', // Violet fonce
};

/**
 * Couleurs de contour selon le statut
 */
const STATUS_BORDER_COLORS: Record<string, string> = {
  transaction: '#1f2937', // Noir
  disponible: '#22C55E',  // Vert
};

/**
 * Cree une icone personnalisee avec couleur source + contour statut
 */
const createPriceIcon = (
  price: number,
  source: string,
  status: string,
  selected: boolean
) => {
  const fillColor = SOURCE_COLORS[source] || '#3B82F6';
  const borderColor = STATUS_BORDER_COLORS[status] || '#1f2937';
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
        background: ${fillColor};
        border: ${borderWidth} solid ${borderColor};
        border-radius: 8px;
        padding: 4px 8px;
        font-size: 12px;
        font-weight: 600;
        color: #ffffff;
        white-space: nowrap;
        box-shadow: ${shadow};
        cursor: pointer;
        line-height: 1.4;
      ">
        ${formattedPrice} <span style="font-size:10px;font-weight:400;opacity:0.9;">EUR/m\u00B2</span>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

/**
 * Icone pour le bien evalue (bleu, etoile distinctive)
 */
const evaluatedPropertyIcon = L.divIcon({
  className: '',
  html: `
    <div style="
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 32px;
      height: 32px;
      background: #2563EB;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
    </div>
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
  const defaultCenter: MapCenter = { lat: 48.8566, lng: 2.3522 };
  const mapCenter = center || defaultCenter;

  if (!center) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="min-h-[500px] flex items-center justify-center bg-gray-100">
          <p className="text-gray-500 text-center">
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
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden relative z-0">
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={13}
        style={{ height: '700px', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater center={mapCenter} distanceKm={distanceKm} />

        {/* Marqueur du bien evalue (violet, etoile) */}
        <Marker
          position={[mapCenter.lat, mapCenter.lng]}
          icon={evaluatedPropertyIcon}
        >
          <Popup>
            <div className="text-sm font-medium">Bien evalue</div>
          </Popup>
        </Marker>

        {/* Marqueurs des comparables avec clustering */}
        <MarkerClusterGroup
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          maxClusterRadius={60}
          chunkedLoading={true}
        >
          {comparables.map((comparable) => {
            const isSelected = selectedIds.includes(comparable.id);

            return (
              <Marker
                key={comparable.id}
                position={[comparable.latitude, comparable.longitude]}
                icon={createPriceIcon(
                  comparable.price_per_m2,
                  comparable.source,
                  comparable.status || 'transaction',
                  isSelected
                )}
                eventHandlers={{
                  click: () => onMarkerClick(comparable),
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-medium mb-1">{comparable.address}</p>
                    <p className="text-gray-600">
                      {comparable.surface} m{'\u00B2'} - {comparable.price_per_m2.toLocaleString('fr-FR')} EUR/m{'\u00B2'}
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
                    <div className="flex gap-1 mt-1">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs text-white ${
                          comparable.source === 'arthur_loyd' ? 'bg-red-500' : 'bg-violet-700'
                        }`}
                      >
                        {comparable.source === 'arthur_loyd' ? 'Arthur Loyd' : 'Concurrence'}
                      </span>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs text-white ${
                          comparable.status === 'disponible' ? 'bg-green-500' : 'bg-gray-800'
                        }`}
                      >
                        {comparable.status === 'disponible' ? 'Disponible' : 'Transaction'}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>

      <ComparableMapLegend />
    </div>
  );
}
