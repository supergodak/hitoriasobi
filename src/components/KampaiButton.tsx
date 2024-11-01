import React, { useState } from 'react';
import { Beer, Trash2 } from 'lucide-react';
import { useKampaiNow } from '../hooks/useKampaiNow';
import { useAuth } from '../contexts/AuthContext';

interface KampaiButtonProps {
  establishmentId: string;
}

const KampaiButton: React.FC<KampaiButtonProps> = ({ establishmentId }) => {
  const { currentUser } = useAuth();
  const { createKampai, cooldown, cooldownEndTime, deleteKampai, activeKampais } = useKampaiNow();
  const [loading, setLoading] = useState(false);

  const getRemainingTime = () => {
    if (!cooldownEndTime) return '';
    const remaining = Math.ceil((cooldownEndTime.getTime() - Date.now()) / 1000);
    return `(${remaining}秒)`;
  };

  const userKampai = currentUser && activeKampais.find(
    k => k.user_id === currentUser.id && k.establishment_id === establishmentId
  );

  const handleKampai = async (isAnonymous: boolean = false) => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      await createKampai(
        establishmentId,
        currentUser.id,
        isAnonymous
      );
    } catch (error) {
      console.error('Error creating kampai:', error);
      alert(error instanceof Error ? error.message : 'カンパイなうの作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!userKampai) return;
    
    try {
      setLoading(true);
      await deleteKampai(userKampai.id);
    } catch (error) {
      console.error('Error deleting kampai:', error);
      alert('カンパイなうの削除に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <button
        disabled
        className="flex items-center px-3 py-1 bg-gray-300 text-white rounded-full cursor-not-allowed"
      >
        <Beer className="w-4 h-4 mr-1" />
        ログインしてカンパイ
      </button>
    );
  }

  if (userKampai) {
    return (
      <button
        onClick={handleDelete}
        disabled={loading}
        className="flex items-center px-3 py-1 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4 mr-1" />
        カンパイを取り消す
      </button>
    );
  }

  return (
    <div className="flex space-x-2">
      <button
        onClick={() => handleKampai(false)}
        disabled={loading || cooldown}
        className="flex items-center px-3 py-1 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50"
      >
        <Beer className="w-4 h-4 mr-1" />
        カンパイなう {cooldown && getRemainingTime()}
      </button>
      <button
        onClick={() => handleKampai(true)}
        disabled={loading || cooldown}
        className="flex items-center px-3 py-1 bg-gray-600 text-white rounded-full hover:bg-gray-700 disabled:opacity-50"
      >
        匿名でカンパイ {cooldown && getRemainingTime()}
      </button>
    </div>
  );
};

export default KampaiButton;