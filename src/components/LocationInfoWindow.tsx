import React from 'react';
import { Location } from '../types/Location';
import { Link } from 'react-router-dom';
import { Tent, Building2, MapPin, Store } from 'lucide-react';

interface LocationInfoWindowProps {
  position: google.maps.LatLngLiteral;
  existingLocations: Location[];
  onSubmit: (location: LocationFormData) => Promise<void>;
  onClose: () => void;
}

interface LocationFormData {
  name: string;
  type: Location['type'];
  latitude: number;
  longitude: number;
  district?: string;
  amenities?: AmenityFilters;
}

const LocationInfoWindow: React.FC<LocationInfoWindowProps> = ({
  existingLocations,
  onClose
}) => {
  const getTypeIcon = (type: Location['type']) => {
    switch (type) {
      case 'camp': return <Tent className="w-5 h-5" />;
      case 'hotel': return <Building2 className="w-5 h-5" />;
      case 'spot': return <MapPin className="w-5 h-5" />;
      case 'shop': return <Store className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 min-w-[300px] max-w-[400px]">
      <h3 className="text-lg font-bold mb-4">この場所の施設</h3>
      <div className="space-y-3 mb-4">
        {existingLocations.map(location => (
          <Link
            key={location.id}
            to={`/locations/${location.id}`}
            className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
          >
            <div className="flex items-center">
              {getTypeIcon(location.type)}
              <span className="ml-2 font-medium">{location.name}</span>
            </div>
            {location.district && (
              <div className="text-sm text-gray-500 mt-1">
                {location.district}
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* 新規登録フォームは一時的に非表示
      <div className="border-t pt-4">
        <h4 className="font-medium mb-2">新しい施設を追加</h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          ...
        </form>
      </div>
      */}

      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          閉じる
        </button>
      </div>
    </div>
  );
};

export default LocationInfoWindow;