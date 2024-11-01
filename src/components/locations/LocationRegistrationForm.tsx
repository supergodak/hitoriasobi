import React, { useState } from 'react';
import { LocationType } from '../../types/Location';
import { AmenityFilters } from '../../types/Amenity';

interface LocationRegistrationFormProps {
  position: google.maps.LatLngLiteral;
  onSubmit: (data: LocationFormData) => Promise<void>;
  onClose: () => void;
}

interface LocationFormData {
  name: string;
  type: LocationType;
  latitude: number;
  longitude: number;
  amenities: AmenityFilters;
}

const LocationRegistrationForm: React.FC<LocationRegistrationFormProps> = ({
  position,
  onSubmit,
  onClose
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<LocationType>('camp');
  const [amenities, setAmenities] = useState<AmenityFilters>({
    requireShower: false,
    requirePower: false,
    requireParking: false,
    requirePetFriendly: false,
    requireWifi: false
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      await onSubmit({
        name: name.trim(),
        type,
        latitude: position.lat,
        longitude: position.lng,
        amenities
      });
      onClose();
    } catch (error) {
      console.error('Error submitting location:', error);
      alert('場所の登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          名称
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          種類
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as LocationType)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
        >
          <option value="camp">キャンプ場</option>
          <option value="hotel">宿泊施設</option>
          <option value="spot">観光地</option>
          <option value="shop">アウトドアショップ</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          設備・サービス
        </label>
        <div className="space-y-2">
          {Object.entries({
            requireShower: 'シャワー',
            requirePower: '電源',
            requireParking: '駐車場',
            requirePetFriendly: 'ペット可',
            requireWifi: 'Wi-Fi'
          }).map(([key, label]) => (
            <label key={key} className="flex items-center">
              <input
                type="checkbox"
                checked={amenities[key as keyof AmenityFilters] || false}
                onChange={(e) => setAmenities(prev => ({
                  ...prev,
                  [key]: e.target.checked
                }))}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          {loading ? '登録中...' : '登録する'}
        </button>
      </div>
    </form>
  );
};

export default LocationRegistrationForm;