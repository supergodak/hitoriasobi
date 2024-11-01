-- establishments テーブルに is_hidden カラムを追加
ALTER TABLE establishments
ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT false;

-- インデックスを作成して検索を最適化
CREATE INDEX IF NOT EXISTS idx_establishments_is_hidden 
ON establishments(is_hidden) 
WHERE is_hidden = false;

-- 既存のクラスター取得関数を更新
CREATE OR REPLACE FUNCTION get_district_clusters(
  min_lat double precision,
  min_lng double precision,
  max_lat double precision,
  max_lng double precision
)
RETURNS TABLE (
  district TEXT,
  count BIGINT,
  latitude double precision,
  longitude double precision
)
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH district_stats AS (
    SELECT
      e.district,
      COUNT(*) as count,
      AVG(ST_Y(e.location::geometry)) as avg_lat,
      AVG(ST_X(e.location::geometry)) as avg_lng
    FROM establishments e
    WHERE 
      e.district IS NOT NULL
      AND ST_Within(
        e.location,
        ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326)
      )
      AND NOT e.is_hidden
    GROUP BY e.district
  )
  SELECT
    ds.district,
    ds.count,
    ds.avg_lat as latitude,
    ds.avg_lng as longitude
  FROM district_stats ds
  ORDER BY ds.count DESC;
END;
$$ LANGUAGE plpgsql STABLE;