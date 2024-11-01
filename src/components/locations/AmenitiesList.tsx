import React from 'react';
import { Droplets, Power, Car, Dog, Wifi } from 'lucide-react';
import { Amenity } from '../../types/Amenity';

interface AmenitiesListProps {
  amenities: Amenity;
}

const AmenitiesList: React.FC<AmenitiesListProps> = ({ amenities }) => {
  const amenityItems = [
    { key: 'shower', icon: <Droplets />, label: 'シャワー', value: amenities.has_shower },
    { key: 'power', icon: <Power />, label: '電源', value: amenities.has_power },
    { key: 'parking', icon: <Car />, label: '駐車場', value: amenities.has_parking },
    { key: 'pet', icon: <Dog />, label: 'ペット可', value: amenities.is_pet_friendly },
    { key: 'wifi', icon: <Wifi />, label: 'Wi-Fi', value: amenities.has_wifi }
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {amenityItems.map(({ key, icon, label, value }) => (
        value && (
          <div
            key={key}
            className="flex items-center px-2 py-1 bg-green-100 text-green-800 rounded"
          >
            <span className="w-4 h-4 mr-1">{icon}</span>
            <span className="text-sm">{label}</span>
          </div>
        )
      ))}
    </div>
  );
};

export default AmenitiesList;