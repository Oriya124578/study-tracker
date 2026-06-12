import { swrFetch } from './cacheService';

// Simple local cache to avoid redundant network calls during the same session.
const cache = {};

const CITY_MAPPINGS = {
  jerusalem: 'IL-Jerusalem',
  tel_aviv: 'IL-Tel Aviv',
  haifa: 'IL-Haifa',
  beer_sheva: 'IL-Beer Sheva',
  netanya: 'IL-Netanya',
  petah_tikva: 'IL-Petach Tikva',
  rishon_lezion: 'IL-Rishon LeZion',
  ashdod: 'IL-Ashdod',
};

export const CITIES_LIST = [
  { value: 'jerusalem', label: 'ירושלים' },
  { value: 'tel_aviv', label: 'תל אביב' },
  { value: 'haifa', label: 'חיפה' },
  { value: 'beer_sheva', label: 'באר שבע' },
  { value: 'netanya', label: 'נתניה' },
  { value: 'petah_tikva', label: 'פתח תקווה' },
  { value: 'rishon_lezion', label: 'ראשון לציון' },
  { value: 'ashdod', label: 'אשדוד' },
];

/**
 * Fetch Shabbat times for a given location (coords or city).
 * @param {Object} location - { latitude, longitude } or { city: 'jerusalem' }
 * @param {string} dateStr - Optional date query (YYYY-MM-DD), default is current week.
 * @param {Function} onData - Optional SWR callback receiving (data, isCached)
 * @returns {Promise<{start: string, end: string, title: string}|null>}
 */
export const fetchShabbatTimes = async (location, dateStr = '', onData = null) => {
  // b = minutes before sunset for candle-lighting.
  // Standard in Israel: 30 min (Jerusalem: 40). Google/Chabad use 30.
  // M=on calculates Havdalah based on 8.5 degrees (standard Israeli 3 stars).
  // GPS path: detect Jerusalem proximity (~15km of the Old City) for the 40-min custom.
  const nearJerusalem =
    location?.latitude && location?.longitude &&
    Math.abs(Number(location.latitude) - 31.778) < 0.14 &&
    Math.abs(Number(location.longitude) - 35.235) < 0.16;
  const candleMinutes = (location?.city === 'jerusalem' || nearJerusalem) ? 40 : 30;
  let url = `https://www.hebcal.com/shabbat?cfg=json&b=${candleMinutes}&M=on&tzid=Asia/Jerusalem`;
  
  if (dateStr) {
    // Hebcal accepts an optional date
    url += `&gy=${dateStr.substring(0, 4)}&gm=${dateStr.substring(5, 7)}&gd=${dateStr.substring(8, 10)}`;
  }

  let cacheKey = '';

  if (location?.latitude && location?.longitude) {
    const lat = Number(location.latitude).toFixed(4);
    const lon = Number(location.longitude).toFixed(4);
    url += `&geo=pos&latitude=${lat}&longitude=${lon}`;
    cacheKey = `coords-${lat}-${lon}-${dateStr}`;
  } else {
    const cityKey = location?.city || 'jerusalem';
    const hebcalCity = CITY_MAPPINGS[cityKey] || CITY_MAPPINGS.jerusalem;
    url += `&city=${encodeURIComponent(hebcalCity)}`;
    cacheKey = `city-${cityKey}-${dateStr}`;
  }

  // Return session cached result if available immediately
  if (cache[cacheKey] && !onData) {
    return cache[cacheKey];
  }

  const fetcher = async () => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Hebcal request failed with status: ${response.status}`);
    }
    const data = await response.json();

    let start = null;
    let end = null;

    if (Array.isArray(data.items)) {
      const candlesItem = data.items.find((item) => item.category === 'candles');
      const havdalahItem = data.items.find((item) => item.category === 'havdalah');

      if (candlesItem) start = candlesItem.date; // ISO String
      if (havdalahItem) end = havdalahItem.date; // ISO String
    }

    if (!start || !end) return null;

    const result = {
      start,
      end,
      title: data.location?.title || 'שבת',
    };
    
    cache[cacheKey] = result;
    return result;
  };

  try {
    // We use a TTL of 24 hours (24 * 60 * 60 * 1000) because Shabbat times for a specific date don't change.
    const result = await swrFetch(cacheKey, fetcher, (data, isCached) => {
      if (onData) onData(data, isCached);
    }, 24 * 60 * 60 * 1000);
    return result;
  } catch (error) {
    console.error('[Shabbat Service] Error fetching times:', error);
    return null;
  }
};
