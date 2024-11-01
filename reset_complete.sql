-- Step 1: 既存のトリガーを削除
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: 既存の関数を削除
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS create_kampai_now(uuid, uuid, boolean) CASCADE;
DROP FUNCTION IF EXISTS find_nearby_establishments(double precision, double precision, int) CASCADE;
DROP FUNCTION IF EXISTS extract_hour_immutable(timestamp with time zone) CASCADE;
DROP FUNCTION IF EXISTS get_recommended_logs(uuid) CASCADE;
DROP FUNCTION IF EXISTS setup_storage_policies() CASCADE;
DROP FUNCTION IF EXISTS process_mentions() CASCADE;
DROP FUNCTION IF EXISTS cleanup_expired_kampai_now() CASCADE;

-- Step 3: ストレージポリシーを削除
DROP POLICY IF EXISTS "Images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- Step 4: ストレージバケットの中身とバケットを削除
DELETE FROM storage.objects WHERE bucket_id IN ('drink-log-images', 'comment-images');
DELETE FROM storage.buckets WHERE id IN ('drink-log-images', 'comment-images');

-- Step 5: 既存のテーブルを削除
DROP TABLE IF EXISTS kampai_now CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS drink_log_images CASCADE;
DROP TABLE IF EXISTS drink_logs CASCADE;
DROP TABLE IF EXISTS establishments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Step 6: public スキーマを完全にリセット
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Step 7: PostGIS拡張機能を有効化
CREATE EXTENSION IF NOT EXISTS postgis;

-- Step 8: テーブルを作成
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE establishments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location GEOMETRY(Point, 4326) NOT NULL,
  smoking_status TEXT CHECK (smoking_status IN ('allowed', 'separated', 'no_smoking')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id)
);

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  store_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, store_id)
);

CREATE TABLE kampai_now (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 9: インデックスを作成
CREATE INDEX idx_establishments_location ON establishments USING GIST(location);
CREATE INDEX idx_comments_store ON comments(store_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_likes_store ON likes(store_id);
CREATE INDEX idx_likes_user ON likes(user_id);
CREATE INDEX idx_kampai_now_establishment ON kampai_now(establishment_id);
CREATE INDEX idx_kampai_now_user ON kampai_now(user_id);
CREATE INDEX idx_kampai_now_expires ON kampai_now(expires_at);

-- Step 10: RLSポリシーを設定
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE kampai_now ENABLE ROW LEVEL SECURITY;

-- ユーザーテーブルのポリシー
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid() = id);

-- 店舗テーブルのポリシー
CREATE POLICY "Anyone can view establishments" ON establishments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create establishments" ON establishments 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- コメントテーブルのポリシー
CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON comments 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can delete their own comments" ON comments 
  FOR DELETE USING (auth.uid() = user_id);

-- いいねテーブルのポリシー
CREATE POLICY "Anyone can view likes" ON likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like" ON likes 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can remove their likes" ON likes 
  FOR DELETE USING (auth.uid() = user_id);

-- カンパイなうテーブルのポリシー
CREATE POLICY "Anyone can view kampai_now" ON kampai_now FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create kampai_now" ON kampai_now 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can delete their own kampai" ON kampai_now 
  FOR DELETE USING (auth.uid() = user_id);

-- Step 11: ストレージバケットを作成
INSERT INTO storage.buckets (id, name, public, allowed_mime_types)
VALUES 
  ('drink-log-images', 'drink-log-images', true, ARRAY['image/jpeg', 'image/png']::text[]),
  ('comment-images', 'comment-images', true, ARRAY['image/jpeg', 'image/png']::text[]);

-- Step 12: ストレージポリシーを設定
CREATE POLICY "Images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id IN ('drink-log-images', 'comment-images'));

CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id IN ('drink-log-images', 'comment-images')
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
USING (
  bucket_id IN ('drink-log-images', 'comment-images')
  AND auth.uid() = (owner)::uuid
);

-- Step 13: 関数を作成
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

CREATE OR REPLACE FUNCTION create_kampai_now(
  p_establishment_id UUID,
  p_user_id UUID,
  p_is_anonymous BOOLEAN DEFAULT false
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
  v_last_kampai TIMESTAMP WITH TIME ZONE;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID is required';
  END IF;

  SELECT created_at INTO v_last_kampai
  FROM kampai_now
  WHERE user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_last_kampai IS NOT NULL AND 
     v_last_kampai > CURRENT_TIMESTAMP - INTERVAL '15 seconds' THEN
    RAISE EXCEPTION 'Please wait before creating another kampai';
  END IF;

  INSERT INTO kampai_now (
    establishment_id,
    user_id,
    is_anonymous,
    expires_at
  )
  VALUES (
    p_establishment_id,
    p_user_id,
    p_is_anonymous,
    CURRENT_TIMESTAMP + INTERVAL '30 minutes'
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION cleanup_expired_kampai_now()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM kampai_now
  WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$;