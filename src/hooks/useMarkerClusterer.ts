import { useState, useEffect, useCallback, useRef } from 'react';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { Location } from '../types/Location';

interface MarkerClustererProps {
  map: google.maps.Map | null;
  locations: Location[];
  onMarkerClick?: (locations: Location[], position: google.maps.LatLngLiteral) => void;
  tempMarker?: google.maps.marker.AdvancedMarkerElement | null;
}

export const useMarkerClusterer = ({
  map,
  locations,
  onMarkerClick,
  tempMarker
}: MarkerClustererProps) => {
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [initialized, setInitialized] = useState(false);

  const createMarker = useCallback((location: Location): google.maps.marker.AdvancedMarkerElement | null => {
    if (!window.google?.maps?.marker?.AdvancedMarkerElement) return null;

    const position = { lat: location.latitude, lng: location.longitude };
    
    const marker = new window.google.maps.marker.AdvancedMarkerElement({
      position,
      title: location.name,
      content: new google.maps.marker.PinElement({
        background: '#22C55E',
        borderColor: '#ffffff',
        glyphColor: '#ffffff',
      }).element,
    });

    marker.addListener('click', () => {
      if (tempMarker) {
        tempMarker.map = null;
      }

      const nearbyLocations = locations.filter(l => 
        Math.abs(l.latitude - location.latitude) < 0.0001 && 
        Math.abs(l.longitude - location.longitude) < 0.0001
      );
      
      if (onMarkerClick) {
        onMarkerClick(nearbyLocations, position);
      }
    });

    return marker;
  }, [locations, onMarkerClick, tempMarker]);

  useEffect(() => {
    if (!map || !locations?.length) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      marker.map = null;
    });
    markersRef.current = [];

    // Create new markers
    const newMarkers = locations
      .map(location => createMarker(location))
      .filter((marker): marker is google.maps.marker.AdvancedMarkerElement => marker !== null);

    markersRef.current = newMarkers;

    // Update or create clusterer
    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
      clustererRef.current.addMarkers(newMarkers as unknown as google.maps.Marker[]);
    } else {
      clustererRef.current = new MarkerClusterer({
        map,
        markers: newMarkers as unknown as google.maps.Marker[],
        onClusterClick: (_, cluster) => {
          if (tempMarker) {
            tempMarker.map = null;
          }
          
          if (map && cluster.markers) {
            const bounds = new google.maps.LatLngBounds();
            (cluster.markers as unknown as google.maps.marker.AdvancedMarkerElement[]).forEach(marker => {
              if (marker.position) {
                bounds.extend(marker.position);
              }
            });
            map.fitBounds(bounds);
          }
        },
        renderer: {
          render: ({ count, position }) => {
            if (!window.google?.maps?.marker?.AdvancedMarkerElement) {
              return new google.maps.Marker();
            }
            
            return new google.maps.marker.AdvancedMarkerElement({
              position,
              content: new google.maps.marker.PinElement({
                background: '#22C55E',
                borderColor: '#ffffff',
                glyphColor: '#ffffff',
                glyph: `${count}`,
              }).element,
            }) as unknown as google.maps.Marker;
          }
        }
      });
      setInitialized(true);
    }

    return () => {
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
      }
      markersRef.current.forEach(marker => {
        marker.map = null;
      });
      markersRef.current = [];
    };
  }, [map, locations, createMarker]);

  return {
    markers: markersRef.current,
    clusterer: clustererRef.current,
    initialized
  };
};