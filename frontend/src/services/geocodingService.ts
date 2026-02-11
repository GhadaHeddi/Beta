/**
 * Service de géocodage utilisant OpenStreetMap Nominatim (gratuit)
 */

export interface AddressDetails {
  house_number?: string;
  road?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  postcode?: string;
  country?: string;
}

export interface GeocodingResult {
  lat: number;
  lng: number;
  displayName: string;
  shortAddress: string;
  found: boolean;
}

/**
 * Construit une adresse courte à partir des composants Nominatim
 * Format : numéro, rue, ville, code postal, pays
 */
function buildShortAddress(address: AddressDetails): string {
  const parts: string[] = [];

  // Numéro + rue
  const street = [address.house_number, address.road].filter(Boolean).join(' ');
  if (street) parts.push(street);

  // Ville (priorité : city > town > village > municipality > county)
  const city = address.city || address.town || address.village || address.municipality || address.county;
  if (city) parts.push(city);

  // Code postal
  if (address.postcode) parts.push(address.postcode);

  // Pays
  if (address.country) parts.push(address.country);

  return parts.join(', ');
}

/**
 * Géocode une adresse et retourne les coordonnées
 * @param address Adresse à géocoder
 * @returns Coordonnées et informations de l'adresse
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult> {
  if (!address || address.trim().length === 0) {
    return {
      lat: 0,
      lng: 0,
      displayName: '',
      shortAddress: '',
      found: false,
    };
  }

  try {
    // Utilisation de l'API Nominatim d'OpenStreetMap (gratuite)
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'fr',
          'User-Agent': 'OryemApp/1.0', // Nominatim requiert un User-Agent
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur de géocodage: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const result = data[0];
      const addressDetails: AddressDetails = result.address || {};
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        displayName: result.display_name,
        shortAddress: buildShortAddress(addressDetails),
        found: true,
      };
    }

    // Adresse non trouvée
    return {
      lat: 0,
      lng: 0,
      displayName: '',
      shortAddress: '',
      found: false,
    };
  } catch (error) {
    console.error('Erreur lors du géocodage:', error);
    return {
      lat: 0,
      lng: 0,
      displayName: '',
      shortAddress: '',
      found: false,
    };
  }
}

/**
 * Géocodage inverse : coordonnées vers adresse
 * @param lat Latitude
 * @param lng Longitude
 * @returns Adresse complète et courte
 */
export async function reverseGeocode(lat: number, lng: number): Promise<{ displayName: string; shortAddress: string } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'fr',
          'User-Agent': 'OryemApp/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur de géocodage inverse: ${response.status}`);
    }

    const data = await response.json();
    const addressDetails: AddressDetails = data.address || {};
    return {
      displayName: data.display_name || '',
      shortAddress: buildShortAddress(addressDetails),
    };
  } catch (error) {
    console.error('Erreur lors du géocodage inverse:', error);
    return null;
  }
}
