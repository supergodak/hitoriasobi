import { useState, useEffect } from 'react';
import { supabase } from '../db/config';
import { CampLog } from '../types/CampLog';

const CHECK_IN_INTERVAL = 12 * 60 * 60 * 1000; // 12時間（ミリ秒）

export const useCampLogs = (userId?: string) => {
  const [logs, setLogs] = useState<CampLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('camp_logs')
        .select(`
          *,
          location:locations (
            name,
            type,
            district
          ),
          user:users (
            username
          ),
          images:camp_log_images (
            id,
            image_url,
            created_by,
            created_at
          ),
          comments:camp_log_comments (
            id,
            user_id,
            content,
            created_at,
            user:users (
              username
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const filteredLogs = userId 
        ? data?.filter(log => log.user_id === userId)
        : data;

      setLogs(filteredLogs || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching camp logs:', err);
      setError('キャンプログの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    const channels = [
      supabase
        .channel('camp_logs_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'camp_logs',
            filter: userId ? `user_id=eq.${userId}` : undefined
          },
          fetchLogs
        )
        .subscribe(),

      supabase
        .channel('camp_log_images_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'camp_log_images'
          },
          fetchLogs
        )
        .subscribe(),

      supabase
        .channel('camp_log_comments_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'camp_log_comments'
          },
          fetchLogs
        )
        .subscribe()
    ];

    return () => {
      channels.forEach(channel => channel.unsubscribe());
    };
  }, [userId]);

  const canCheckIn = async (locationId: string, userId: string): Promise<boolean> => {
    try {
      const checkTime = new Date(Date.now() - CHECK_IN_INTERVAL);
      
      const { data, error } = await supabase
        .from('camp_logs')
        .select('created_at')
        .eq('location_id', locationId)
        .eq('user_id', userId)
        .gte('created_at', checkTime.toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (!data || data.length === 0) return true;

      const lastCheckIn = new Date(data[0].created_at);
      const timeSinceLastCheckIn = Date.now() - lastCheckIn.getTime();

      return timeSinceLastCheckIn >= CHECK_IN_INTERVAL;
    } catch (err) {
      console.error('Error checking check-in status:', err);
      throw new Error('チェックイン状態の確認に失敗しました');
    }
  };

  const createLog = async (locationId: string, content?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('ログインが必要です');

      const canCheck = await canCheckIn(locationId, user.id);
      if (!canCheck) {
        throw new Error('この場所には12時間以内にチェックイン済みです');
      }

      const { data, error } = await supabase
        .from('camp_logs')
        .insert([{
          user_id: user.id,
          location_id: locationId,
          content
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error creating camp log:', err);
      if (err instanceof Error) {
        throw err;
      }
      throw new Error('キャンプログの作成に失敗しました');
    }
  };

  return {
    logs,
    loading,
    error,
    createLog,
    canCheckIn,
    refreshLogs: fetchLogs
  };
};