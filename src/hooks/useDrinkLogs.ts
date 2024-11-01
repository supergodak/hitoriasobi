import { useState, useEffect } from 'react';
import { supabase } from '../db/config';
import { DrinkLog, DrinkLogInput } from '../types/DrinkLog';

export const useDrinkLogs = () => {
  const [logs, setLogs] = useState<DrinkLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error: dbError } = await supabase
        .from('drink_logs')
        .select(`
          *,
          establishment:establishments (
            name,
            location,
            smoking_status
          ),
          drink_log_images (image_url)
        `)
        .order('created_at', { ascending: false });

      if (dbError) throw dbError;

      const formattedLogs = (data || []).map((log: any) => ({
        ...log,
        images: log.drink_log_images?.map((img: any) => img.image_url) || []
      }));

      setLogs(formattedLogs);
      setError(null);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('飲みログの取得に失敗しました');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const createLog = async (logData: DrinkLogInput, images?: string[]) => {
    try {
      const { data: logEntry, error: logError } = await supabase
        .from('drink_logs')
        .insert([{
          user_id: logData.user_id,
          establishment_id: logData.establishment_id,
          content: logData.content
        }])
        .select()
        .single();

      if (logError) throw logError;

      if (images && images.length > 0) {
        const imageInserts = images.map(url => ({
          drink_log_id: logEntry.id,
          image_url: url
        }));

        const { error: imageError } = await supabase
          .from('drink_log_images')
          .insert(imageInserts);

        if (imageError) throw imageError;
      }

      await fetchLogs();
      return logEntry;
    } catch (err) {
      console.error('Error creating log:', err);
      throw new Error('飲みログの作成に失敗しました');
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return {
    logs,
    loading,
    error,
    refreshLogs: fetchLogs,
    createLog
  };
};