import { useState, useEffect } from 'react';
import { supabase } from '../db/config';
import { Location, LocationType } from '../types/Location';
import { Amenity } from '../types/Amenity';

interface TrendingLocation extends Location {
  amenities: Amenity;
  activity_count: number;
  like_count: number;
  latest_activity: string;
}

export const useTrendingLocations = (type?: LocationType) => {
  const [locations, setLocations] = useState<TrendingLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchLocations = async (offset = 0) => {
    try {
      setLoading(true);
      const { data, error: dbError } = await supabase
        .rpc('get_trending_locations', {
          p_limit: 10,
          p_offset: offset,
          p_type: type
        });

      if (dbError) throw dbError;

      // 新しいデータを既存のデータとマージする際に重複を除去
      const uniqueLocations = offset === 0 
        ? data 
        : [...locations, ...data.filter(newLoc => 
            !locations.some(existingLoc => existingLoc.id === newLoc.id)
          )];

      setLocations(uniqueLocations);
      setHasMore(data.length === 10);
      setError(null);
    } catch (err) {
      console.error('Error fetching trending locations:', err);
      setError('人気の場所を取得できませんでした');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations(0);
  }, [type]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchLocations(locations.length);
    }
  };

  return { locations, loading, error, hasMore, loadMore };
};