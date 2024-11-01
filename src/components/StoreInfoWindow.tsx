import React, { useState } from 'react';
import { Store } from '../hooks/useStores';
import { Link } from 'react-router-dom';
import { Cigarette } from 'lucide-react';

interface StoreInfoWindowProps {
  position: google.maps.LatLngLiteral;
  existingStores: Store[];
  onSubmit: (store: Omit<Store, 'id'>) => Promise<void>;
  onClose: () => void;
}

const StoreInfoWindow: React.FC<StoreInfoWindowProps> = ({
  position,
  existingStores,
  onSubmit,
  onClose
}) => {
  const [name, setName] = useState('');
  const [smokingStatus, setSmokingStatus] = useState<Store['smoking_status']>('unknown');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);

      // 逆ジオコーディングを実行
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ location: position });

      let district = '';
      if (result.results[0]) {
        const addressComponents = result.results[0].address_components;
        const prefecture = addressComponents.find(c => c.types.includes('administrative_area_level_1'))?.long_name || '';
        const city = addressComponents.find(c => c.types.includes('locality'))?.long_name || '';
        const ward = addressComponents.find(c => c.types.includes('sublocality_level_1'))?.long_name || '';
        const town = addressComponents.find(c => c.types.includes('sublocality_level_2'))?.long_name || '';
        
        // 都道府県、市区町村、町名を連結
        district = [prefecture, city, ward, town].filter(Boolean).join(' ');
      }

      await onSubmit({
        name: name.trim(),
        latitude: position.lat,
        longitude: position.lng,
        smoking_status: smokingStatus,
        district
      });
      onClose();
    } catch (error) {
      console.error('Error submitting store:', error);
      alert('店舗の登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 min-w-[300px] max-w-[400px]">
      {existingStores.length > 0 ? (
        <>
          <h3 className="text-lg font-bold mb-4">この場所の店舗</h3>
          <div className="space-y-3 mb-4">
            {existingStores.map(store => (
              <Link
                key={store.id}
                to={`/stores/${store.id}`}
                className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <div className="font-medium">{store.name}</div>
                <div className="text-sm text-gray-500 flex items-center mt-1">
                  <Cigarette className="w-4 h-4 mr-1" />
                  {store.smoking_status === 'no_smoking' ? '禁煙' :
                   store.smoking_status === 'separated' ? '分煙' :
                   store.smoking_status === 'unknown' ? '不明' : '喫煙可'}
                </div>
              </Link>
            ))}
          </div>
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">新しい店舗を追加</h4>
          </div>
        </>
      ) : (
        <h3 className="text-lg font-bold mb-4">新しい店舗を登録</h3>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            店舗名
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            喫煙
          </label>
          <select
            value={smokingStatus}
            onChange={(e) => setSmokingStatus(e.target.value as Store['smoking_status'])}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="unknown">不明</option>
            <option value="allowed">喫煙可</option>
            <option value="separated">分煙</option>
            <option value="no_smoking">禁煙</option>
          </select>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? '登録中...' : '登録する'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StoreInfoWindow;