import React, { useState, useEffect } from 'react';
import { supabase } from '../db/config';
import { useAuth } from '../contexts/AuthContext';
import DrinkLogList from './DrinkLogList';
import { Sparkles } from 'lucide-react';
import { DrinkLog } from '../types/DrinkLog';

const RecommendedLogs: React.FC = () => {
  const { currentUser } = useAuth();
  const [recommendations, setRecommendations] = useState<DrinkLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .rpc('get_recommended_logs', {
            target_user_id: currentUser.id
          });

        if (error) throw error;

        // 投稿の詳細情報を取得
        const logs = await Promise.all(
          data.map(async (rec: any) => {
            const { data: logData } = await supabase
              .from('drink_logs')
              .select(`
                *,
                establishment:establishments (
                  name,
                  latitude,
                  longitude,
                  smoking_status
                ),
                users (username)
              `)
              .eq('id', rec.drink_log_id)
              .single();
            return logData;
          })
        );

        setRecommendations(logs.filter(Boolean));
      } catch (err) {
        console.error('Error fetching recommendations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-600">おすすめを探しています...</div>
      </div>
    );
  }

  if (!recommendations.length) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-600">
        まだおすすめがありません。もっと飲みログを投稿してみましょう！
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <Sparkles className="w-6 h-6 mr-2 text-yellow-500" />
        あなたにおすすめの飲みログ
      </h2>
      <DrinkLogList logs={recommendations} />
    </div>
  );
};

export default RecommendedLogs;