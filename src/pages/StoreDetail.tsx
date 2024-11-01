import React from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { Beer, Cigarette, Search } from 'lucide-react';
import LikeButton from '../components/LikeButton';
import Comments from '../components/Comments';
import KampaiButton from '../components/KampaiButton';

const StoreDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { store, loading, error } = useStore(id!);

  const handleGoogleSearch = () => {
    if (!store) return;
    
    const searchQuery = `${store.name} ${store.district || ''}`.trim();
    const encodedQuery = encodeURIComponent(searchQuery);
    const searchUrl = `https://www.google.com/search?q=${encodedQuery}`;
    window.open(searchUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          店舗情報の取得に失敗しました
        </div>
      </div>
    );
  }

  const getSmokingStatusText = (status: string) => {
    switch (status) {
      case 'no_smoking': return '禁煙';
      case 'separated': return '分煙';
      case 'allowed': return '喫煙可';
      case 'unknown':
      default: return '不明';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <h1 className="text-2xl font-bold flex items-center">
              <Beer className="mr-2" />
              {store.name}
              {store.district && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  （{store.district}）
                </span>
              )}
            </h1>
            <button
              onClick={handleGoogleSearch}
              className="ml-2 p-2 text-gray-500 hover:text-red-600 transition-colors"
              title="Google で検索"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center text-gray-600 mb-6">
            <Cigarette className="w-5 h-5 mr-2" />
            <span>{getSmokingStatusText(store.smoking_status)}</span>
          </div>

          <div className="flex items-center space-x-4 mb-6">
            <LikeButton storeId={store.id} />
            <KampaiButton establishmentId={store.id} />
          </div>

          <div className="mt-6">
            <Comments storeId={store.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreDetail;