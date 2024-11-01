import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../db/config';
import debounce from 'lodash/debounce';
import { Location, LocationType } from '../types/Location';
import { AmenityFilters } from '../types/Amenity';

interface CreateLocationData {
  name: string;
  type: LocationType;
  latitude: number;
  longitude: number;
  district?: string;
  amenities?: AmenityFilters;
}

export const useStores = (bounds: google.maps.LatLngBounds | null) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = useCallback(async (bounds: google.maps.LatLngBounds) => {
    try {
      setLoading(true);
      const { data, error: dbError } = await supabase
        .rpc('find_locations_in_bounds', {
          min_lat: bounds.getSouthWest().lat(),
          min_lng: bounds.getSouthWest().lng(),
          max_lat: bounds.getNorthEast().lat(),
          max_lng: bounds.getNorthEast().lng()
        });

      if (dbError) throw dbError;
      setLocations(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching locations:', err);
      setError('場所の情報を取得できませんでした');
      setLocations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetchLocations = useCallback(
    debounce((bounds: google.maps.LatLngBounds) => {
      fetchLocations(bounds);
    }, 500),
    [fetchLocations]
  );

  const createLocation = async (newLocation: CreateLocationData) => {
    try {
      setLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.user) throw new Error('ログインが必要です');

      // Create location
      const { data: locationData, error: locationError } = await supabase
        .from('locations')
        .insert([{
          name: newLocation.name,
          type: newLocation.type,
          location: `POINT(${newLocation.longitude} ${newLocation.latitude})`,
          district: newLocation.district,
          created_by: session.user.id
        }])
        .select()
        .single();

      if (locationError) throw locationError;

      // Create amenities
      if (newLocation.amenities) {
        const { error: amenityError } = await supabase
          .from('amenities')
          .insert([{
            location_id: locationData.id,
            has_shower: newLocation.amenities.requireShower || false,
            has_power: newLocation.amenities.requirePower || false,
            has_parking: newLocation.amenities.requireParking || false,
            is_pet_friendly: newLocation.amenities.requirePetFriendly || false,
            has_wifi: newLocation.amenities.requireWifi || false
          }]);

        if (amenityError) throw amenityError;
      }

      if (bounds) {
        await fetchLocations(bounds);
      }
      return locationData;
    } catch (err) {
      console.error('Error creating location:', err);
      throw new Error('場所の登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bounds) {
      debouncedFetchLocations(bounds);
    }
    
    return () => {
      debouncedFetchLocations.cancel();
    };
  }, [bounds, debouncedFetchLocations]);

  return { locations, loading, error, createLocation };
};