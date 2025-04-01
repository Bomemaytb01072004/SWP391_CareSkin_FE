/**
 * Simple caching utility for storing and retrieving data with expiration
 */

// Cache storage object
const cache = {};

/**
 * Set data in cache with expiration time
 * @param {string} key - Cache key
 * @param {any} data - Data to store
 * @param {number} expirationMinutes - Cache expiration time in minutes (default: 5)
 */
export const setCache = (key, data, expirationMinutes = 5) => {
  const now = new Date();
  const expirationTime = new Date(now.getTime() + expirationMinutes * 60000);
  
  cache[key] = {
    data,
    expiration: expirationTime
  };
  
  // Also store in localStorage for persistence between page refreshes
  try {
    localStorage.setItem(
      `cache_${key}`, 
      JSON.stringify({
        data,
        expiration: expirationTime.getTime()
      })
    );
  } catch (error) {
    console.warn('Failed to store cache in localStorage:', error);
  }
};

/**
 * Get data from cache if it exists and hasn't expired
 * @param {string} key - Cache key
 * @returns {any|null} - Cached data or null if not found or expired
 */
export const getCache = (key) => {
  const now = new Date();
  
  // First try memory cache
  if (cache[key] && new Date(cache[key].expiration) > now) {
    console.log(`Cache hit for ${key} (memory)`);
    return cache[key].data;
  }
  
  // Then try localStorage
  try {
    const storedCache = localStorage.getItem(`cache_${key}`);
    if (storedCache) {
      const parsedCache = JSON.parse(storedCache);
      if (new Date(parsedCache.expiration) > now) {
        console.log(`Cache hit for ${key} (localStorage)`);
        // Restore to memory cache
        cache[key] = {
          data: parsedCache.data,
          expiration: new Date(parsedCache.expiration)
        };
        return parsedCache.data;
      } else {
        // Clean up expired localStorage cache
        localStorage.removeItem(`cache_${key}`);
      }
    }
  } catch (error) {
    console.warn('Failed to retrieve cache from localStorage:', error);
  }
  
  console.log(`Cache miss for ${key}`);
  return null;
};

/**
 * Clear a specific cache entry
 * @param {string} key - Cache key to clear
 */
export const clearCache = (key) => {
  delete cache[key];
  try {
    localStorage.removeItem(`cache_${key}`);
  } catch (error) {
    console.warn('Failed to remove cache from localStorage:', error);
  }
};

/**
 * Clear all cache entries
 */
export const clearAllCache = () => {
  Object.keys(cache).forEach(key => delete cache[key]);
  
  try {
    const localStorageKeys = Object.keys(localStorage);
    localStorageKeys.forEach(key => {
      if (key.startsWith('cache_')) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Failed to clear cache from localStorage:', error);
  }
};
