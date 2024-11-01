import { useState, useEffect } from 'react';
import { supabase } from '../db/config';

interface KampaiNow {
  id: string;
  establishment_id: string;
  user_id: string;
  is_anonymous: boolean;
  expires_at: string;
  created_at: string;
  users?: {
    username: string;
  };
  establishments?: {
    name: string;
    district: string;
  };
}

export const useKampaiNow = () => {
  const [activeKampais, setActiveKampais] = useState<KampaiNow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(false);
  const [cooldownEndTime, setCooldownEndTime] = useState<Date | null>(null);

  const fetchActiveKampais = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('kampai_now')
        .select(`
          *,
          users (username),
          establishments (name, district)
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setActiveKampais(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching kampai now:', err);
      setError('カンパイなうの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const createKampai = async (
    establishmentId: string,
    userId: string,
    isAnonymous: boolean = false
  ) => {
    if (cooldown) {
      throw new Error('しばらく待ってからカンパイしてください');
    }

    try {
      const { data, error } = await supabase
        .rpc('create_kampai_now', {
          p_establishment_id: establishmentId,
          p_user_id: userId,
          p_is_anonymous: isAnonymous
        });

      if (error) throw error;

      // クールダウン開始
      setCooldown(true);
      const endTime = new Date(Date.now() + 15 * 1000); // 15秒
      setCooldownEndTime(endTime);

      setTimeout(() => {
        setCooldown(false);
        setCooldownEndTime(null);
      }, 15 * 1000);

      await fetchActiveKampais();
      return data;
    } catch (err) {
      console.error('Error creating kampai:', err);
      if (err instanceof Error) {
        throw new Error(err.message);
      }
      throw new Error('カンパイなうの作成に失敗しました');
    }
  };

  const deleteKampai = async (kampaiId: string) => {
    try {
      const { error } = await supabase
        .from('kampai_now')
        .delete()
        .eq('id', kampaiId);

      if (error) throw error;
      await fetchActiveKampais();
    } catch (err) {
      console.error('Error deleting kampai:', err);
      throw new Error('カンパイなうの削除に失敗しました');
    }
  };

  useEffect(() => {
    fetchActiveKampais();
    const interval = setInterval(fetchActiveKampais, 5000);
    return () => clearInterval(interval);
  }, []);

  return {
    activeKampais,
    loading,
    error,
    cooldown,
    cooldownEndTime,
    createKampai,
    deleteKampai,
    refreshKampais: fetchActiveKampais
  };
};