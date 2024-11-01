import React from 'react';
import { MapPin, Tent, Building2, Store } from 'lucide-react';
import { LocationType } from '../../types/Location';

interface LocationTypeFilterProps {
  selectedType?: LocationType;
  onChange: (type?: LocationType) => void;
}

const LocationTypeFilter: React.FC<LocationTypeFilterProps> = ({
  selectedType,
  onChange
}) => {
  const types: { type: LocationType; icon: React.ReactNode; label: string }[] = [
    { type: 'camp', icon: <Tent className="w-5 h-5" />, label: 'キャンプ場' },
    { type: 'hotel', icon: <Building2 className="w-5 h-5" />, label: '宿泊施設' },
    { type: 'spot', icon: <MapPin className="w-5 h-5" />, label: '観光地' },
    { type: 'shop', icon: <Store className="w-5 h-5" />, label: 'アウトドアショップ' }
  ];

  return (
    <div className="flex space-x-2 p-2 bg-white rounded-lg shadow">
      {types.map(({ type, icon, label }) => (
        <button
          key={type}
          onClick={() => onChange(selectedType === type ? undefined : type)}
          className={`flex items-center px-3 py-2 rounded-md transition-colors ${
            selectedType === type
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {icon}
          <span className="ml-2">{label}</span>
        </button>
      ))}
    </div>
  );
};

export default LocationTypeFilter;