/**
 * Service for Stale-While-Revalidate (SWR) fetching.
 * Caches API responses in localStorage and provides immediate stale data
 * while fetching fresh data in the background.
 */

const CACHE_PREFIX = 'calori_swr_';

/**
 * 
 * @param {string} key - Unique key for the cache (e.g. 'weather_lat_lon')
 * @param {Function} fetcher - Async function that fetches the data from the server
 * @param {Function} onData - Callback function that receives (data, isCached)
 * @param {number} revalidateAfterMs - Only fetch fresh data if cache is older than this (default: 0 = always revalidate)
 */
export const swrFetch = async (key, fetcher, onData, revalidateAfterMs = 0) => {
  const fullKey = CACHE_PREFIX + key;
  let cachedItem = null;

  // 1. Try to get from Cache
  try {
    const raw = localStorage.getItem(fullKey);
    if (raw) {
      cachedItem = JSON.parse(raw);
      if (cachedItem && cachedItem.data) {
        onData(cachedItem.data, true); // Return stale data immediately
      }
    }
  } catch (err) {
    console.warn('[SWR] Failed to read from cache:', err);
  }

  // Check if we should skip revalidation
  const now = Date.now();
  if (cachedItem && cachedItem.timestamp && revalidateAfterMs > 0) {
    if (now - cachedItem.timestamp < revalidateAfterMs) {
      return cachedItem.data;
    }
  }

  // 2. Background Fetch (Revalidate)
  try {
    const freshData = await fetcher();
    
    // Save to cache
    try {
      localStorage.setItem(fullKey, JSON.stringify({
        data: freshData,
        timestamp: now
      }));
    } catch (err) {
      console.warn('[SWR] Failed to write to cache:', err);
    }

    // Pass fresh data to callback
    onData(freshData, false);
    return freshData;
  } catch (error) {
    console.error('[SWR] Background fetch failed for key:', key, error);
    // If background fetch fails, we already provided stale data, so it's somewhat graceful.
    // We could re-throw or call an onError, but for now we just log it.
    throw error;
  }
};
