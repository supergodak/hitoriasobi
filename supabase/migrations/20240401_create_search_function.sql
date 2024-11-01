-- Create district locations search function
CREATE OR REPLACE FUNCTION get_district_locations(
  p_district TEXT,
  p_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  type TEXT,
  district TEXT,
  amenities JSON,
  activity_count BIGINT,
  like_count BIGINT
) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH location_stats AS (
    SELECT
      l.id,
      l.name,
      l.type,
      l.district,
      json_build_object(
        'has_shower', a.has_shower,
        'has_power', a.has_power,
        'has_parking', a.has_parking,
        'is_pet_friendly', a.is_pet_friendly,
        'has_wifi', a.has_wifi
      ) as amenities,
      COUNT(DISTINCT act.id) as activity_count,
      COUNT(DISTINCT lk.id) as like_count
    FROM locations l
    LEFT JOIN amenities a ON l.id = a.location_id
    LEFT JOIN activities act ON l.id = act.location_id
    LEFT JOIN likes lk ON l.id = lk.store_id
    WHERE 
      l.district = p_district
      AND (p_type IS NULL OR l.type = p_type)
      AND NOT l.is_hidden
    GROUP BY 
      l.id, 
      l.name, 
      l.type, 
      l.district, 
      a.has_shower, 
      a.has_power, 
      a.has_parking, 
      a.is_pet_friendly, 
      a.has_wifi
  )
  SELECT * FROM location_stats
  ORDER BY 
    activity_count DESC,
    like_count DESC,
    name;
END;
$$ LANGUAGE plpgsql STABLE;