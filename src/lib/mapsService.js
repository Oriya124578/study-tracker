/**
 * Service to calculate travel duration between two locations.
 * Supports Google Maps Directions API (requires key) and falls back to
 * a free solution using OpenStreetMap Nominatim (geocoding) + OSRM (routing).
 */

const cache = {};

/** Get the Google Maps API key from localStorage or VITE env. */
export const getGoogleMapsApiKey = () => {
  return localStorage.getItem('google_maps_api_key') || import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
};

/**
 * Geocode a text address into [latitude, longitude] using OpenStreetMap Nominatim.
 * Free, public, no key required.
 */
const geocodeAddress = async (address) => {
  if (!address || typeof address !== 'string') return null;
  const trimmed = address.trim();
  if (cache[trimmed]) return cache[trimmed];

  try {
    // Add email to comply with Nominatim's usage policy
    const email = import.meta.env.VITE_NOMINATIM_EMAIL || 'contact@calori.life';
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&limit=1&email=${email}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const results = await response.json();

    if (results && results.length > 0) {
      const coords = {
        lat: parseFloat(results[0].lat),
        lon: parseFloat(results[0].lon),
      };
      cache[trimmed] = coords;
      return coords;
    }
    return null;
  } catch (err) {
    console.warn('[Maps Service] Nominatim geocode failed:', err);
    return null;
  }
};

/**
 * Calculate driving travel time using Open Source Routing Machine (OSRM).
 * Free, public, no key required.
 */
const getOSRMRouteTime = async (originCoords, destCoords) => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${originCoords.lon},${originCoords.lat};${destCoords.lon},${destCoords.lat}?overview=false`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      // duration is in seconds, convert to minutes
      const durationSeconds = data.routes[0].duration;
      return Math.round(durationSeconds / 60);
    }
    return null;
  } catch (err) {
    console.warn('[Maps Service] OSRM route failed:', err);
    return null;
  }
};

/**
 * Calculate travel time using Google Maps Directions API.
 */
const getGoogleMapsDirectionsTime = async (origin, destination, apiKey) => {
  try {
    // We can fetch from client-side but note that Google Maps Directions API
    // might block client-side fetch due to CORS unless JSONP or proxy is used.
    // However, it supports standard web queries, but we fall back gracefully if CORS occurs.
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&key=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();

    if (data.routes && data.routes.length > 0 && data.routes[0].legs && data.routes[0].legs.length > 0) {
      const durationSeconds = data.routes[0].legs[0].duration.value;
      return Math.round(durationSeconds / 60);
    }
    return null;
  } catch (err) {
    console.warn('[Maps Service] Google Maps API failed (likely CORS or invalid key):', err);
    return null;
  }
};

/**
 * Main function to calculate travel time (in minutes) between two locations.
 * @param {string|Object} origin - Address string or {lat, lon}
 * @param {string|Object} destination - Address string or {lat, lon}
 * @returns {Promise<number>} - Travel time in minutes (default is 30 minutes fallback)
 */
export const calculateTravelTime = async (origin, destination) => {
  if (!origin || !destination) return 0;

  const key = getGoogleMapsApiKey();
  // Helper to format string representation
  const getLat = (coord) => coord?.lat ?? coord?.latitude;
  const getLon = (coord) => coord?.lon ?? coord?.longitude;
  
  const originLat = typeof origin === 'string' ? null : getLat(origin);
  const originLon = typeof origin === 'string' ? null : getLon(origin);
  const destLat = typeof destination === 'string' ? null : getLat(destination);
  const destLon = typeof destination === 'string' ? null : getLon(destination);

  const originStr = typeof origin === 'string' ? origin : `${originLat},${originLon}`;
  const destStr = typeof destination === 'string' ? destination : `${destLat},${destLon}`;

  const cacheKey = `route-${originStr}-${destStr}`;

  if (cache[cacheKey] !== undefined) {
    return cache[cacheKey];
  }

  // 1. Try Google Maps if API key is provided
  if (key && typeof origin === 'string' && typeof destination === 'string') {
    const googleTime = await getGoogleMapsDirectionsTime(origin, destination, key);
    if (googleTime !== null) {
      cache[cacheKey] = googleTime;
      return googleTime;
    }
  }

  // 2. Try Nominatim + OSRM (free option)
  try {
    let originCoords = null;
    let destCoords = null;

    if (typeof origin === 'string') {
      originCoords = await geocodeAddress(origin);
    } else if (typeof originLat === 'number' && typeof originLon === 'number') {
      originCoords = { lat: Number(originLat), lon: Number(originLon) };
    }

    if (typeof destination === 'string') {
      destCoords = await geocodeAddress(destination);
    } else if (typeof destLat === 'number' && typeof destLon === 'number') {
      destCoords = { lat: Number(destLat), lon: Number(destLon) };
    }

    if (originCoords && destCoords) {
      const osrmTime = await getOSRMRouteTime(originCoords, destCoords);
      if (osrmTime !== null) {
        cache[cacheKey] = osrmTime;
        return osrmTime;
      }
    }
  } catch (err) {
    console.warn('[Maps Service] Free routing fallback failed:', err);
  }

  // 3. Fallback to default estimate (30 minutes)
  const defaultEstimate = 30;
  cache[cacheKey] = defaultEstimate;
  return defaultEstimate;
};
