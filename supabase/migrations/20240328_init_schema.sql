-- 既存のテーブルを全て削除
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS drink_log_images CASCADE;
DROP TABLE IF EXISTS drink_logs CASCADE;
DROP TABLE IF EXISTS establishments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- PostGIS拡張機能の有効化
CREATE EXTENSION IF NOT EXISTS postgis;

-- ユーザーテーブル
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 店舗テーブル
CREATE TABLE establishments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location GEOMETRY(Point, 4326) NOT NULL,
  smoking_status TEXT CHECK (smoking_status IN ('allowed', 'separated', 'no_smoking')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id)
);

-- 飲みログテーブル
CREATE TABLE drink_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  establishment_id UUID NOT NULL REFERENCES establishments(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 飲みログ画像テーブル
CREATE TABLE drink_log_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  drink_log_id UUID NOT NULL REFERENCES drink_logs(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- いいねテーブル
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  drink_log_id UUID NOT NULL REFERENCES drink_logs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, drink_log_id)
);

-- コメントテーブル
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  drink_log_id UUID NOT NULL REFERENCES drink_logs(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックスの作成
CREATE INDEX idx_establishments_location ON establishments USING GIST(location);
CREATE INDEX idx_drink_logs_user ON drink_logs(user_id);
CREATE INDEX idx_drink_logs_establishment ON drink_logs(establishment_id);
CREATE INDEX idx_drink_log_images_log ON drink_log_images(drink_log_id);
CREATE INDEX idx_likes_log ON likes(drink_log_id);
CREATE INDEX idx_likes_user ON likes(user_id);
CREATE INDEX idx_comments_log ON comments(drink_log_id);
CREATE INDEX idx_comments_user ON comments(user_id);

-- RLSポリシーの設定
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE drink_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE drink_log_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- ユーザーテーブルのポリシー
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid() = id);

-- 店舗テーブルのポリシー
CREATE POLICY "Anyone can view establishments" ON establishments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create establishments" ON establishments 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 飲みログテーブルのポリシー
CREATE POLICY "Anyone can view drink logs" ON drink_logs FOR SELECT USING (true);
CREATE POLICY "Users can create their own drink logs" ON drink_logs 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- コメントテーブルのポリシー
CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON comments 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can delete their own comments" ON comments 
  FOR DELETE USING (auth.uid() = user_id);

-- ストレージバケットの設定
INSERT INTO storage.buckets (id, name, public, allowed_mime_types)
VALUES (
  'drink-log-images',
  'drink-log-images',
  true,
  ARRAY['image/jpeg', 'image/png', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif']::text[];

-- 近くの店舗を検索する関数
CREATE OR REPLACE FUNCTION find_nearby_establishments(
  lat double precision,
  lng double precision,
  radius_meters int DEFAULT 500
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  latitude double precision,
  longitude double precision,
  smoking_status TEXT,
  distance_meters double precision
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.name,
    ST_Y(e.location::geometry) as latitude,
    ST_X(e.location::geometry) as longitude,
    e.smoking_status,
    ST_Distance(
      e.location::geography,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
    ) as distance_meters
  FROM establishments e
  WHERE ST_DWithin(
    e.location::geography,
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
    radius_meters
  )
  ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql STABLE;