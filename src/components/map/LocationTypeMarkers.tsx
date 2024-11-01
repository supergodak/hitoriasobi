import React from 'react';
import { Location } from '../../types/Location';

interface LocationTypeMarkersProps {
  locations: Location[];
  onMarkerClick: (location: Location) => void;
}

const LocationTypeMarkers: React.FC<LocationTypeMarkersProps> = ({
  locations,
  onMarkerClick
}) => {
  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'camp': return '#22C55E'; // green-600
      case 'hotel': return '#0EA5E9'; // sky-500
      case 'spot': return '#EAB308'; // yellow-500
      case 'shop': return '#EC4899'; // pink-500
      default: return '#6B7280'; // gray-500
    }
  };

  React.useEffect(() => {
    if (!window.google?.maps?.marker?.AdvancedMarkerElement) return;

    const markers = locations.map(location => {
      const position = {
        lat: location.latitude,
        lng: location.longitude
      };

      const marker = new google.maps.marker.AdvancedMarkerElement({
        position,
        title: location.name,
        content: new google.maps.marker.PinElement({
          background: getMarkerColor(location.type),
          borderColor: '#ffffff',
          glyphColor: '#ffffff',
        }).element,
      });

      marker.addListener('click', () => {
        onMarkerClick(location);
      });

      return marker;
    });

    return () => {
      markers.forEach(marker => {
        marker.map = null;
      });
    };
  }, [locations, onMarkerClick]);

  return null;
};

export default LocationTypeMarkers;