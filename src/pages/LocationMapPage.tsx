import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import { Navigation, Search } from 'lucide-react';
import { useLocations } from '../hooks/useLocations';
import LocationRegistrationForm from '../components/locations/LocationRegistrationForm';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import LocationTypeFilter from '../components/locations/LocationTypeFilter';
import { LocationType } from '../types/Location';

const GOOGLE_MAPS_LIBRARIES: ("places" | "geometry" | "marker")[] = ["places", "geometry", "marker"];
const MAX_RETRY_COUNT = 3;
const RETRY_DELAY = 1000;

const DEFAULT_CENTER = {
  lat: 35.6812,
  lng: 139.7671
};

const mapOptions: google.maps.MapOptions = {
  mapId: import.meta.env.VITE_GOOGLE_MAP_ID || '',
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  clickableIcons: false,
  mapTypeId: 'roadmap',
  backgroundColor: '#ffffff',
  restriction: {
    latLngBounds: {
      north: 45.7,
      south: 25.6,
      west: 122.9,
      east: 146.2
    },
    strictBounds: true
  }
};

const LocationMapPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState<google.maps.LatLngLiteral>(DEFAULT_CENTER);
  const [bounds, setBounds] = useState<google.maps.LatLngBounds | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [selectedLocations, setSelectedLocations] = useState<Location[]>([]);
  const [tempMarker, setTempMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [showSearchButton, setShowSearchButton] = useState(false);
  const [lastSearchedBounds, setLastSearchedBounds] = useState<google.maps.LatLngBounds | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<LocationType>();

  const { locations, loading, error, createLocation } = useLocations(bounds, selectedType);
  
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    mapIds: [import.meta.env.VITE_GOOGLE_MAP_ID || ''],
    language: 'ja',
    region: 'JP',
    libraries: GOOGLE_MAPS_LIBRARIES,
    version: "weekly"
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCenter = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCenter(newCenter);
          if (map) {
            map.panTo(newCenter);
            const newBounds = map.getBounds();
            if (newBounds) {
              setBounds(newBounds);
              setLastSearchedBounds(newBounds);
            }
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setInitializationError('現在位置を取得できませんでした。デフォルトの位置を使用します。');
        }
      );
    }
  }, [map]);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng || !map || !currentUser) return;
    
    const position = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };

    if (tempMarker) {
      tempMarker.map = null;
    }

    const newTempMarker = new google.maps.marker.AdvancedMarkerElement({
      map,
      position,
      content: new google.maps.marker.PinElement({
        background: '#22C55E',
        borderColor: '#FFFFFF',
        glyphColor: '#FFFFFF',
        scale: 1.2
      }).element,
      title: '新規登録位置'
    });

    setTempMarker(newTempMarker);
    setSelectedLocations([]);
    setSelectedPosition(position);
  }, [map, currentUser, tempMarker]);

  const handleLocationSubmit = async (data: LocationFormData) => {
    try {
      await createLocation(data);
      if (tempMarker) {
        tempMarker.map = null;
        setTempMarker(null);
      }
      setSelectedPosition(null);
      setSelectedLocations([]);
    } catch (error) {
      console.error('Error creating location:', error);
      throw error;
    }
  };

  const handleGetCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCenter = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCenter(newCenter);
          map?.panTo(newCenter);
          setShowSearchButton(false);
          if (map) {
            setBounds(map.getBounds() || null);
            setLastSearchedBounds(map.getBounds() || null);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setInitializationError('現在位置を取得できませんでした。');
        }
      );
    }
  }, [map]);

  const handleBoundsChanged = useCallback(() => {
    if (!map) return;
    
    const newBounds = map.getBounds();
    if (!newBounds) return;

    if (lastSearchedBounds) {
      const center = newBounds.getCenter();
      if (!lastSearchedBounds.contains(center)) {
        setShowSearchButton(true);
        setBounds(null);
      }
    }
  }, [map, lastSearchedBounds]);

  const handleSearch = useCallback(() => {
    if (!map) return;
    
    const newBounds = map.getBounds();
    if (!newBounds) return;

    setBounds(newBounds);
    setLastSearchedBounds(newBounds);
    setShowSearchButton(false);
  }, [map]);

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-600">地図の読み込みに失敗しました</div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">地図を読み込んでいます...</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4 text-center">ログインが必要です</h2>
          <p className="text-gray-600 mb-6 text-center">
            場所を登録・共有するには、ログインが必要です。
          </p>
          <Link
            to="/login"
            className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            ログインする
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen relative">
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <LocationTypeFilter
          selectedType={selectedType}
          onChange={setSelectedType}
        />
      </div>

      <button
        onClick={handleGetCurrentLocation}
        className="absolute top-4 right-4 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
        aria-label="現在地に移動"
      >
        <Navigation className="w-6 h-6" />
      </button>

      {showSearchButton && (
        <button
          onClick={handleSearch}
          className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10 bg-green-600 text-white px-4 py-2 rounded-full shadow-md hover:bg-green-700 flex items-center"
        >
          <Search className="w-4 h-4 mr-2" />
          現在の表示範囲で検索
        </button>
      )}

      {loading && (
        <div className="absolute top-4 left-4 z-10 bg-white px-4 py-2 rounded-full shadow-md">
          <span className="text-sm">読み込み中...</span>
        </div>
      )}

      {initializationError && (
        <div className="absolute top-4 left-4 z-10 bg-red-50 text-red-600 px-4 py-2 rounded-lg shadow-md">
          {initializationError}
        </div>
      )}

      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={15}
        options={mapOptions}
        onLoad={(map) => {
          setMap(map);
          const initialBounds = map.getBounds();
          if (initialBounds) {
            setBounds(initialBounds);
            setLastSearchedBounds(initialBounds);
          }
        }}
        onClick={handleMapClick}
        onBoundsChanged={handleBoundsChanged}
      />

      {selectedPosition && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="bg-white rounded-lg shadow-lg p-4 min-w-[300px] max-w-[400px]">
            <LocationRegistrationForm
              position={selectedPosition}
              onSubmit={handleLocationSubmit}
              onClose={() => {
                if (tempMarker) {
                  tempMarker.map = null;
                  setTempMarker(null);
                }
                setSelectedPosition(null);
                setSelectedLocations([]);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationMapPage;