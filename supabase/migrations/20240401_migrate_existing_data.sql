-- Step 1: Migrate existing smoking_status data to type
UPDATE locations
SET type = CASE
  WHEN district LIKE '%キャンプ場%' THEN 'camp'
  WHEN district LIKE '%ホテル%' OR district LIKE '%旅館%' THEN 'hotel'
  ELSE 'spot'
END
WHERE type IS NULL;

-- Step 2: Create default amenities for existing locations
INSERT INTO amenities (location_id)
SELECT id FROM locations
WHERE NOT EXISTS (
  SELECT 1 FROM amenities WHERE location_id = locations.id
);

-- Step 3: Migrate existing activities data
UPDATE activities
SET activity_type = CASE
  WHEN EXISTS (
    SELECT 1 FROM locations l
    WHERE l.id = activities.location_id
    AND l.type = 'camp'
  ) THEN 'camp'
  ELSE 'travel'
END
WHERE activity_type IS NULL;

-- Step 4: Clean up expired activities
DELETE FROM activities
WHERE expires_at < CURRENT_TIMESTAMP;

-- Step 5: Update location search function
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
  GROUP BY l.id, l.name, l.type, l.district, a.has_shower, a.has_power, 
           a.has_parking, a.is_pet_friendly, a.has_wifi
  ORDER BY activity_count DESC, like_count DESC;
END;
$$ LANGUAGE plpgsql STABLE;