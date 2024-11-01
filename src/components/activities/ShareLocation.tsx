import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../db/config';
import { Search } from 'lucide-react';
import { useCampLogs } from '../../hooks/useCampLogs';

interface ShareLocationProps {
  locationId: string;
  locationName: string;
  district?: string;
}

const COOLDOWN_TIME = 60 * 1000; // 1分のクールダウン

const ShareLocation: React.FC<ShareLocationProps> = ({ locationId, locationName, district }) => {
  const { currentUser } = useAuth();
  const { createLog } = useCampLogs();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [cooldownEndTime, setCooldownEndTime] = useState<Date | null>(null);

  const getRemainingTime = () => {
    if (!cooldownEndTime) return '';
    const remaining = Math.ceil((cooldownEndTime.getTime() - Date.now()) / 1000);
    return `(${remaining}秒)`;
  };

  const handleShare = async () => {
    if (!currentUser) {
      alert('チェックインするにはログインが必要です');
      return;
    }

    if (cooldown) {
      alert('しばらく待ってからチェックインしてください');
      return;
    }

    try {
      setLoading(true);

      // キャンプログを作成（重複チェックも含む）
      await createLog(locationId, content);

      // アクティビティを作成
      const { error } = await supabase
        .from('activities')
        .insert([{
          location_id: locationId,
          user_id: currentUser.id,
          is_anonymous: false,
          activity_type: 'camp',
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30分後
        }]);

      if (error) throw error;

      // クールダウン開始
      setCooldown(true);
      const endTime = new Date(Date.now() + COOLDOWN_TIME);
      setCooldownEndTime(endTime);

      setTimeout(() => {
        setCooldown(false);
        setCooldownEndTime(null);
      }, COOLDOWN_TIME);

      setContent(''); // 入力をクリア
      alert('チェックインしました！');
    } catch (error) {
      console.error('Error sharing location:', error);
      alert(error instanceof Error ? error.message : 'チェックインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSearch = () => {
    if (!locationName) return;
    
    const searchQuery = district 
      ? `${locationName} ${district}` 
      : locationName;
    
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    window.open(searchUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h3 className="text-lg font-medium">
            {locationName}
            {district && <span className="text-sm text-gray-600 ml-2">（{district}）</span>}
          </h3>
          <button
            onClick={handleGoogleSearch}
            className="ml-2 text-gray-500 hover:text-gray-700"
            title="Google で検索"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      <button
        onClick={handleShare}
        disabled={loading || cooldown}
        className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        📍
        <span className="ml-2">
          {loading ? '共有中...' : cooldown ? `クールダウン中 ${getRemainingTime()}` : 'チェックイン'}
        </span>
      </button>
    </div>
  );
};

export default ShareLocation;