import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Check, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { geocodeAddress, reverseGeocode, type GeocodingResult } from '@/services/geocodingService';

// Import des styles Leaflet
import 'leaflet/dist/leaflet.css';

// Fix pour l'icône du marqueur Leaflet en React
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Icône personnalisée pour le marqueur
const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface AddressMapProps {
  address: string;
  onConfirm: (lat: number, lng: number) => void;
  onChangeAddress: () => void;
  onAddressUpdate?: (newAddress: string) => void;
  isValidating?: boolean;
  isConfirmed?: boolean;
}

// Composant pour recentrer la carte quand les coordonnées changent
function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    if (lat !== 0 && lng !== 0) {
      map.setView([lat, lng], 16, { animate: true });
    }
  }, [lat, lng, map]);

  return null;
}

export function AddressMap({
  address,
  onConfirm,
  onChangeAddress,
  onAddressUpdate,
  isValidating = false,
  isConfirmed = false,
}: AddressMapProps) {
  const [coordinates, setCoordinates] = useState<GeocodingResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  // Géocoder l'adresse quand elle change
  useEffect(() => {
    async function fetchCoordinates() {
      if (!address || address.trim().length === 0) {
        setCoordinates(null);
        setIsLoading(false);
        setError("Aucune adresse fournie");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await geocodeAddress(address);

        if (result.found) {
          setCoordinates(result);
          setError(null);
        } else {
          setCoordinates(null);
          setError("Adresse non trouvée. Veuillez vérifier l'orthographe ou essayer une adresse plus précise.");
        }
      } catch (err) {
        setError("Erreur lors de la localisation de l'adresse");
        setCoordinates(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCoordinates();
  }, [address]);

  // Scroll vers la carte quand elle est prête
  useEffect(() => {
    if (!isLoading && mapRef.current && isValidating) {
      mapRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isLoading, isValidating]);

  // Gestion du déplacement du marqueur
  const handleMarkerDragEnd = async (event: L.DragEndEvent) => {
    const marker = event.target;
    const position = marker.getLatLng();
    setIsDragging(false);

    try {
      // Géocodage inverse pour obtenir l'adresse
      const newAddress = await reverseGeocode(position.lat, position.lng);

      if (newAddress) {
        // Mettre à jour les coordonnées locales
        setCoordinates({
          lat: position.lat,
          lng: position.lng,
          displayName: newAddress,
          found: true,
        });

        // Notifier le parent du changement d'adresse
        onAddressUpdate?.(newAddress);
      }
    } catch (err) {
      console.error('Erreur lors du géocodage inverse:', err);
    }
  };

  // Affichage pendant le chargement
  if (isLoading) {
    return (
      <div ref={mapRef} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-600 text-lg">Localisation de l'adresse en cours...</p>
          <p className="text-gray-400 text-sm mt-2">{address}</p>
        </div>
      </div>
    );
  }

  // Affichage en cas d'erreur
  if (error || !coordinates) {
    return (
      <div ref={mapRef} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Adresse non localisée</h3>
          <p className="text-gray-500 text-center mb-6 max-w-md">
            {error || "Nous n'avons pas pu localiser cette adresse sur la carte."}
          </p>
          <p className="text-gray-400 text-sm mb-6 bg-gray-50 px-4 py-2 rounded-lg">
            Adresse saisie : {address}
          </p>
          <button
            onClick={onChangeAddress}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Modifier l'adresse
          </button>
        </div>
      </div>
    );
  }

  // Affichage de la carte avec l'adresse géolocalisée
  return (
    <div ref={mapRef} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative z-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Vérification de l'adresse</h3>
            <p className="text-blue-100 text-sm">Confirmez que l'emplacement est correct</p>
          </div>
        </div>
      </div>

      {/* Carte */}
      <div className="h-[400px] relative">
        <MapContainer
          center={[coordinates.lat, coordinates.lng]}
          zoom={16}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={[coordinates.lat, coordinates.lng]}
            icon={customIcon}
            draggable={!isConfirmed}
            eventHandlers={{
              dragstart: () => setIsDragging(true),
              dragend: handleMarkerDragEnd,
            }}
          >
            <Popup>
              <div className="text-sm">
                <strong>Adresse localisée :</strong>
                <br />
                {coordinates.displayName}
                {!isConfirmed && (
                  <p className="text-xs text-blue-600 mt-2 italic">
                    Déplacez le marqueur pour ajuster la position
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
          <MapRecenter lat={coordinates.lat} lng={coordinates.lng} />
        </MapContainer>
      </div>

      {/* Adresse trouvée */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
            isDragging ? 'bg-blue-100' : 'bg-green-100'
          }`}>
            <MapPin className={`w-4 h-4 ${isDragging ? 'text-blue-600' : 'text-green-600'}`} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">
              {isDragging ? 'Déplacement en cours...' : 'Adresse localisée :'}
            </p>
            <p className="text-sm text-gray-600 mt-1">{coordinates.displayName}</p>
            {!isConfirmed && !isDragging && (
              <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                <span className="inline-block w-4 h-4">↕️</span>
                Vous pouvez déplacer le marqueur sur la carte pour ajuster l'emplacement
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Question de confirmation */}
      <div className="px-6 py-5 border-t border-gray-200">
        <p className="text-center text-gray-700 font-medium mb-5">
          Est-ce bien l'adresse correcte du bien ?
        </p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={onChangeAddress}
            disabled={isConfirmed}
            className={`flex items-center gap-2 px-6 py-3 border-2 rounded-lg transition-colors font-medium ${
              isConfirmed
                ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
            }`}
          >
            <RefreshCw className="w-5 h-5" />
            Changer l'adresse
          </button>
          <button
            onClick={() => coordinates && onConfirm(coordinates.lat, coordinates.lng)}
            disabled={isConfirmed}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium ${
              isConfirmed
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            <Check className="w-5 h-5" />
            {isConfirmed ? 'Adresse confirmée' : 'Confirmer l\'adresse'}
          </button>
        </div>
      </div>
    </div>
  );
}
