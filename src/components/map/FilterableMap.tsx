import React, { useState } from 'react';
import { GoogleMap } from '@react-google-maps/api';
import LocationTypeFilter from '../locations/LocationTypeFilter';
import { Location, LocationType } from '../../types/Location';
import LocationTypeMarkers from './LocationTypeMarkers';

interface FilterableMapProps {
  locations: Location[];
  onMarkerClick: (location: Location) => void;
  center: google.maps.LatLngLiteral;
  onCenterChanged?: (center: google.maps.LatLngLiteral) => void;
}

const FilterableMap: React.FC<FilterableMapProps> = ({
  locations,
  onMarkerClick,
  center,
  onCenterChanged
}) => {
  const [selectedType, setSelectedType] = useState<LocationType>();
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const filteredLocations = selectedType
    ? locations.filter(location => location.type === selectedType)
    : locations;

  const handleCenterChanged = () => {
    if (map && onCenterChanged) {
      const newCenter = map.getCenter();
      if (newCenter) {
        onCenterChanged({
          lat: newCenter.lat(),
          lng: newCenter.lng()
        });
      }
    }
  };

  return (
    <div className="relative h-full">
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <LocationTypeFilter
          selectedType={selectedType}
          onChange={setSelectedType}
        />
      </div>

      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={15}
        onLoad={setMap}
        onCenterChanged={handleCenterChanged}
        options={{
          mapId: import.meta.env.VITE_GOOGLE_MAP_ID || '',
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        }}
      >
        <LocationTypeMarkers
          locations={filteredLocations}
          onMarkerClick={onMarkerClick}
        />
      </GoogleMap>
    </div>
  );
};

export default FilterableMap;