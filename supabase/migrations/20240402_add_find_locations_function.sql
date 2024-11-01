-- Drop existing function if it exists
DROP FUNCTION IF EXISTS find_locations_in_bounds;

-- Create function to find locations in bounds
CREATE OR REPLACE FUNCTION find_locations_in_bounds(
  min_lat double precision,
  min_lng double precision,
  max_lat double precision,
  max_lng double precision,
  location_type text DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  type TEXT,
  latitude double precision,
  longitude double precision,
  district TEXT,
  amenities JSON
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.name,
    l.type,
    ST_Y(l.location::geometry) as latitude,
    ST_X(l.location::geometry) as longitude,
    l.district,
    json_build_object(
      'has_shower', a.has_shower,
      'has_power', a.has_power,
      'has_parking', a.has_parking,
      'is_pet_friendly', a.is_pet_friendly,
      'has_wifi', a.has_wifi
    ) as amenities
  FROM locations l
  LEFT JOIN amenities a ON l.id = a.location_id
  WHERE 
    ST_Within(
      l.location,
      ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326)
    )
    AND NOT l.is_hidden
    AND (location_type IS NULL OR l.type = location_type);
END;
$$ LANGUAGE plpgsql STABLE;