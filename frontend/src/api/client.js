import axios from 'axios';

const API_URL = import.meta.env.VITE_ROUTE_API_URL || 'http://localhost:8000';

// Simple in-memory cache with TTL
const routeCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Debounce helper
let debounceTimer = null;

const getCacheKey = (coordinates, profile) => {
  return `${JSON.stringify(coordinates)}_${profile}`;
};

const getCachedRoute = (key) => {
  const cached = routeCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('Cache hit for route');
    return cached.data;
  }
  return null;
};

const setCachedRoute = (key, data) => {
  routeCache.set(key, { data, timestamp: Date.now() });
};

export const optimizeRoute = async (coordinates, profile = 'driving') => {
  return new Promise((resolve, reject) => {
    // Clear existing debounce timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(async () => {
      try {
        const cacheKey = getCacheKey(coordinates, profile);
        
        // Check cache first
        const cached = getCachedRoute(cacheKey);
        if (cached) {
          resolve(cached);
          return;
        }

        const response = await axios.post(`${API_URL}/optimize-route`, {
          coordinates,
          profile
        }, {
          timeout: 10000 // 10 second timeout
        });

        // Cache the result
        setCachedRoute(cacheKey, response.data);
        resolve(response.data);
      } catch (error) {
        console.error('API Error:', error);
        reject(error);
      }
    }, 300); // 300ms debounce delay
  });
};
