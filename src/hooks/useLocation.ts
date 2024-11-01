import { useState, useEffect } from 'react';
import { supabase } from '../db/config';
import { Location } from '../types/Location';
import { Amenity } from '../types/Amenity';

export const useLocation = (id: string) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [amenities, setAmenities] = useState<Amenity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        setLoading(true);
        
        const { data: locationData, error: locationError } = await supabase
          .from('locations')
          .select('*')
          .eq('id', id)
          .single();

        if (locationError) throw locationError;

        const { data: amenityData, error: amenityError } = await supabase
          .from('amenities')
          .select('*')
          .eq('location_id', id)
          .single();

        if (amenityError && amenityError.code !== 'PGRST116') throw amenityError;

        setLocation(locationData);
        setAmenities(amenityData);
        setError(null);
      } catch (err) {
        console.error('Error fetching location:', err);
        setError('場所の情報を取得できませんでした');
        setLocation(null);
        setAmenities(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLocation();
    }
  }, [id]);

  return { location, amenities, loading, error };
};