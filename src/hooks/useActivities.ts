import { useState, useEffect } from 'react';
import { supabase } from '../db/config';
import { Activity } from '../types/Activity';

export const useActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const { data, error: dbError } = await supabase
          .from('activities')
          .select(`
            *,
            location:locations (
              id,
              name,
              type,
              district
            ),
            user:users (
              username
            )
          `)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(10);

        if (dbError) throw dbError;
        setActivities(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError('アクティビティの取得に失敗しました');
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();

    // リアルタイム更新のサブスクリプション
    const subscription = supabase
      .channel('activities_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities'
        },
        () => {
          fetchActivities();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { activities, loading, error };
};