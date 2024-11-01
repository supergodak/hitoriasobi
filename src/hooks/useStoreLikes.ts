import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../db/config';

export const useStoreLikes = (locationId: string, userId?: string) => {
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchLikeCount = useCallback(async () => {
    try {
      // いいね数の取得
      const { count: likesCount, error: countError } = await supabase
        .from('likes')
        .select('*', { count: 'exact' })
        .eq('location_id', locationId);

      if (countError) throw countError;
      setLikeCount(likesCount || 0);

      // ユーザーがいいねしているか確認
      if (userId) {
        const { data: userLike, error: likeError } = await supabase
          .from('likes')
          .select('*')
          .eq('location_id', locationId)
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
  }, [locationId, userId]);

  const toggleLike = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      if (isLiked) {
        // いいねを削除
        const { error } = await supabase
          .from('likes')
          .delete()
          .match({ location_id: locationId, user_id: userId });

        if (error) throw error;
        setLikeCount(prev => Math.max(0, prev - 1));
        setIsLiked(false);
      } else {
        // いいねを追加
        const { error } = await supabase
          .from('likes')
          .insert([{ location_id: locationId, user_id: userId }]);

        if (error) throw error;
        setLikeCount(prev => prev + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // エラー時は状態を元に戻すため再フェッチ
      await fetchLikeCount();
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