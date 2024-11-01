import { useState, useEffect } from 'react';
import { supabase } from '../db/config';

export interface Store {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  smoking_status: string;
  district?: string;
  created_by: string;
}

export const useStore = (id: string) => {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStore = async () => {
    try {
      setLoading(true);
      const { data, error: dbError } = await supabase
        .from('establishments')
        .select('*')
        .eq('id', id)
        .single();

      if (dbError) throw dbError;
      setStore(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching store:', err);
      setError('店舗情報の取得に失敗しました');
      setStore(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchStore();
    }
  }, [id]);

  return { store, loading, error, refreshStore: fetchStore };
};