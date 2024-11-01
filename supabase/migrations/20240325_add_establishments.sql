-- 店舗テーブルの作成
CREATE TABLE establishments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  smoking_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id),
  UNIQUE (name, latitude, longitude)
);

-- 位置情報のインデックスを作成
CREATE INDEX idx_establishments_location
ON establishments USING gist (
  ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
);

-- 店舗検索を最適化するための関数を作成
CREATE OR REPLACE FUNCTION find_nearby_establishments(
  p_latitude double precision,
  p_longitude double precision,
  p_distance_meters double precision DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  name text,
  latitude double precision,
  longitude double precision,
  smoking_status text,
  distance_meters double precision
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.name,
    e.latitude,
    e.longitude,
    e.smoking_status,
    ST_Distance(
      ST_SetSRID(ST_MakePoint(e.longitude, e.latitude), 4326)::geography,
      ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography
    ) as distance_meters
  FROM establishments e
  WHERE ST_DWithin(
    ST_SetSRID(ST_MakePoint(e.longitude, e.latitude), 4326)::geography,
    ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography,
    p_distance_meters
  )
  ORDER BY distance_meters ASC;
END;
$$;

-- 飲みログテーブルに店舗IDを追加
ALTER TABLE drink_logs
ADD COLUMN establishment_id UUID REFERENCES establishments(id);

-- RLSポリシーの設定
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view establishments"
ON establishments FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert establishments"
ON establishments FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only creator can update establishments"
ON establishments FOR UPDATE
USING (auth.uid() = created_by);