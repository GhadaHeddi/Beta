/**
 * Service de géocodage utilisant OpenStreetMap Nominatim (gratuit)
 */

export interface GeocodingResult {
  lat: number;
  lng: number;
  displayName: string;
  found: boolean;
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
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        displayName: result.display_name,
        found: true,
      };
    }

    // Adresse non trouvée
    return {
      lat: 0,
      lng: 0,
      displayName: '',
      found: false,
    };
  } catch (error) {
    console.error('Erreur lors du géocodage:', error);
    return {
      lat: 0,
      lng: 0,
      displayName: '',
      found: false,
    };
  }
}

/**
 * Géocodage inverse : coordonnées vers adresse
 * @param lat Latitude
 * @param lng Longitude
 * @returns Adresse correspondante
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
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
    return data.display_name || '';
  } catch (error) {
    console.error('Erreur lors du géocodage inverse:', error);
    return '';
  }
}
