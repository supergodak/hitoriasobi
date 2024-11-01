import React from 'react';
import { Beer, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useKampaiNow } from '../hooks/useKampaiNow';
import { useAuth } from '../contexts/AuthContext';

const KampaiNowList: React.FC = () => {
  const { activeKampais, loading, error, deleteKampai } = useKampaiNow();
  const { currentUser } = useAuth();

  const handleDelete = async (kampaiId: string) => {
    try {
      await deleteKampai(kampaiId);
    } catch (error) {
      console.error('Error deleting kampai:', error);
      alert('カンパイなうの削除に失敗しました');
    }
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    return d.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-600">
        {error}
      </div>
    );
  }

  if (activeKampais.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <Beer className="mr-2" />
        カンパイなう！
      </h2>
      <div className="space-y-2">
        {activeKampais.map((kampai) => (
          <div key={kampai.id} className="flex items-center justify-between">
            <div>
              <Link
                to={`/stores/${kampai.establishment_id}`}
                className="text-red-600 hover:text-red-700"
              >
                {kampai.is_anonymous ? '匿名' : kampai.users?.username} さんが
                <span className="font-medium"> {kampai.establishments?.name} </span>
                {kampai.establishments?.district && (
                  <span className="text-gray-600">
                    （{kampai.establishments.district}）
                  </span>
                )}
                で乾杯中
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {formatTime(kampai.created_at)}
              </span>
              {currentUser && currentUser.id === kampai.user_id && (
                <button
                  onClick={() => handleDelete(kampai.id)}
                  className="text-gray-400 hover:text-red-500"
                  title="削除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KampaiNowList;