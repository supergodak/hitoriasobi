import { useState, useEffect } from 'react';
import { supabase } from '../db/config';

interface TrendingStore {
  id: string;
  name: string;
  location: string;
  district: string;
  smoking_status: string;
  comment_count: number;
  like_count: number;
  latest_activity: string;
}

export const useTrendingStores = (limit = 10) => {
  const [stores, setStores] = useState<TrendingStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchStores = async (offset = 0) => {
    try {
      setLoading(true);
      const { data, error: dbError } = await supabase
        .rpc('get_trending_establishments', {
          p_limit: limit,
          p_offset: offset
        });

      if (dbError) throw dbError;

      setStores(prev => offset === 0 ? data : [...prev, ...data]);
      setHasMore(data.length === limit);
      setError(null);
    } catch (err) {
      console.error('Error fetching trending stores:', err);
      setError('店舗データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchStores(stores.length);
    }
  };

  return { stores, loading, error, hasMore, loadMore };
};