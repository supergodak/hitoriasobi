import { useState, useCallback } from 'react';

interface LocationCache {
  [key: string]: {
    address: string;
    timestamp: number;
  }
}

const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 1週間
const CACHE_KEY = 'geocode_cache';
const MAX_CACHE_SIZE = 100; // 最大キャッシュエントリ数

export const useGeocode = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const getLocationKey = (location: string) => {
    try {
      // PostGISのPOINT形式から座標を抽出
      // 例: "POINT(139.7671 35.6812)" → "139.7671,35.6812"
      const match = location.match(/POINT\(([\d.-]+)\s+([\d.-]+)\)/);
      if (!match) return null;
      
      const lng = parseFloat(match[1]);
      const lat = parseFloat(match[2]);
      
      return `${lat.toFixed(4)},${lng.toFixed(4)}`;
    } catch (error) {
      console.error('Error parsing location:', error);
      return null;
    }
  };

  const cleanupCache = () => {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') as LocationCache;
    const now = Date.now();
    
    const validEntries = Object.entries(cache)
      .filter(([_, value]) => now - value.timestamp < CACHE_DURATION)
      .sort((a, b) => b[1].timestamp - a[1].timestamp)
      .slice(0, MAX_CACHE_SIZE);

    const newCache = Object.fromEntries(validEntries);
    localStorage.setItem(CACHE_KEY, JSON.stringify(newCache));
    return newCache;
  };

  const getCachedLocation = (key: string) => {
    try {
      const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') as LocationCache;
      const entry = cache[key];
      
      if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
        return entry.address;
      }

      if (Object.keys(cache).length > MAX_CACHE_SIZE) {
        cleanupCache();
      }

      return null;
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  };

  const setCachedLocation = (key: string, address: string) => {
    try {
      const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') as LocationCache;
      const newCache = {
        ...cache,
        [key]: {
          address,
          timestamp: Date.now()
        }
      };

      if (Object.keys(newCache).length > MAX_CACHE_SIZE) {
        cleanupCache();
      } else {
        localStorage.setItem(CACHE_KEY, JSON.stringify(newCache));
      }
    } catch (error) {
      console.error('Cache write error:', error);
    }
  };

  const getAddress = useCallback(async (location: string): Promise<string> => {
    const locationKey = getLocationKey(location);
    if (!locationKey) return '';
    
    const cached = getCachedLocation(locationKey);
    if (cached) return cached;

    try {
      setLoading(true);
      setError(null);

      // Google Maps APIが利用可能になるまで待機
      if (!window.google?.maps?.Geocoder) {
        await new Promise<void>((resolve) => {
          const checkAPI = setInterval(() => {
            if (window.google?.maps?.Geocoder) {
              clearInterval(checkAPI);
              setIsInitialized(true);
              resolve();
            }
          }, 100);
        });
      }

      const [lng, lat] = locationKey.split(',').map(Number);
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ location: { lat, lng } });
      
      if (!result.results[0]) {
        throw new Error('No results found');
      }

      const address = result.results[0].address_components
        .filter(component => 
          component.types.includes('locality') || 
          component.types.includes('ward') ||
          component.types.includes('sublocality_level_1')
        )
        .map(component => component.long_name)
        .join('');

      if (address) {
        setCachedLocation(locationKey, address);
      }
      return address;

    } catch (err) {
      console.error('Geocoding error:', err);
      setError('住所の取得に失敗しました');
      return '';
    } finally {
      setLoading(false);
    }
  }, []);

  return { getAddress, loading, error, isInitialized };
};