-- 既存の関数を削除
DROP FUNCTION IF EXISTS find_nearby_establishments(double precision, double precision, integer);

-- 地図の表示範囲内の店舗を検索する関数を作成
CREATE OR REPLACE FUNCTION find_establishments_in_bounds(
  min_lat double precision,
  min_lng double precision,
  max_lat double precision,
  max_lng double precision
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  latitude double precision,
  longitude double precision,
  smoking_status TEXT,
  district TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.name,
    ST_Y(e.location::geometry) as latitude,
    ST_X(e.location::geometry) as longitude,
    e.smoking_status,
    e.district
  FROM establishments e
  WHERE ST_Within(
    e.location,
    ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326)
  );
END;
$$ LANGUAGE plpgsql STABLE;