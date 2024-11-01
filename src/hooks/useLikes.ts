import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../db/config';

export const useLikes = (drinkLogId: string, userId?: string) => {
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  // いいね数を取得
  const fetchLikeCount = useCallback(async () => {
    try {
      // いいね数の取得
      const { data: likesData, error: countError } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('drink_log_id', drinkLogId);

      if (countError) throw countError;
      setLikeCount(likesData?.length || 0);

      // ユーザーがいいねしているか確認
      if (userId) {
        const { data: userLike, error: likeError } = await supabase
          .from('likes')
          .select('*')
          .eq('drink_log_id', drinkLogId)
          .eq('user_id', userId)
          .maybeSingle();

        if (likeError && likeError.code !== 'PGRST116') throw likeError;
        setIsLiked(!!userLike);
      }
    } catch (error) {
      console.error('Error fetching likes:', error);
    } finally {
      setLoading(false);
    }
  }, [drinkLogId, userId]);

  // いいねを切り替え
  const toggleLike = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      if (isLiked) {
        // いいねを削除
        const { error } = await supabase
          .from('likes')
          .delete()
          .match({ drink_log_id: drinkLogId, user_id: userId });

        if (error) throw error;
        setLikeCount(prev => Math.max(0, prev - 1));
        setIsLiked(false);
      } else {
        // いいねを追加
        const { error } = await supabase
          .from('likes')
          .insert([{ drink_log_id: drinkLogId, user_id: userId }]);

        if (error) throw error;
        setLikeCount(prev => prev + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLikeCount();
  }, [fetchLikeCount]);

  return {
    likeCount,
    isLiked,
    loading,
    toggleLike,
    refreshLikes: fetchLikeCount
  };
};