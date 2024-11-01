-- Step 1: Create function to get trending locations
CREATE OR REPLACE FUNCTION get_trending_locations(
  p_limit integer DEFAULT 10,
  p_offset integer DEFAULT 0,
  p_type text DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  type TEXT,
  district TEXT,
  amenities JSON,
  activity_count BIGINT,
  like_count BIGINT,
  latest_activity TIMESTAMP WITH TIME ZONE
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
      COUNT(DISTINCT lk.id) as like_count,
      GREATEST(
        l.created_at,
        COALESCE(MAX(act.created_at), l.created_at),
        COALESCE(MAX(lk.created_at), l.created_at)
      ) as latest_activity
    FROM locations l
    LEFT JOIN amenities a ON l.id = a.location_id
    LEFT JOIN activities act ON l.id = act.location_id
    LEFT JOIN likes lk ON l.id = lk.location_id
    WHERE 
      NOT l.is_hidden AND
      (p_type IS NULL OR l.type = p_type)
    GROUP BY 
      l.id, l.name, l.type, l.district, l.created_at,
      a.has_shower, a.has_power, a.has_parking, a.is_pet_friendly, a.has_wifi
  )
  SELECT *
  FROM location_stats
  ORDER BY 
    latest_activity DESC,
    activity_count DESC,
    like_count DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- Step 2: Create function to get recommended locations
CREATE OR REPLACE FUNCTION get_recommended_locations(
  p_user_id UUID,
  p_limit integer DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  type TEXT,
  district TEXT,
  amenities JSON,
  similarity_score INTEGER
) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH user_preferences AS (
    SELECT unnest(preferred_activities) as activity
    FROM users
    WHERE id = p_user_id
  ),
  user_activities AS (
    SELECT location_id, activity_type
    FROM activities
    WHERE user_id = p_user_id
  ),
  user_likes AS (
    SELECT location_id
    FROM likes
    WHERE user_id = p_user_id
  )
  SELECT DISTINCT ON (l.id)
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
    (
      CASE WHEN l.type IN (SELECT activity FROM user_preferences) THEN 3 ELSE 0 END +
      CASE WHEN l.id IN (SELECT location_id FROM user_activities) THEN 2 ELSE 0 END +
      CASE WHEN l.id IN (SELECT location_id FROM user_likes) THEN 1 ELSE 0 END
    ) as similarity_score
  FROM locations l
  LEFT JOIN amenities a ON l.id = a.location_id
  WHERE NOT l.is_hidden
  ORDER BY 
    similarity_score DESC,
    l.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;