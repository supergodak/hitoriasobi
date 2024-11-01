-- 既存のテーブルを全て削除
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS drink_log_images CASCADE;
DROP TABLE IF EXISTS drink_logs CASCADE;
DROP TABLE IF EXISTS establishments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

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
  smoking_status TEXT CHECK (smoking_status IN ('allowed', 'separated', 'outdoor', 'no_smoking', 'unknown')),
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

-- RLSポリシーの設定
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE drink_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE drink_log_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

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
CREATE POLICY "Users can update their own drink logs" ON drink_logs 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own drink logs" ON drink_logs 
  FOR DELETE USING (auth.uid() = user_id);

-- 画像テーブルのポリシー
CREATE POLICY "Anyone can view images" ON drink_log_images FOR SELECT USING (true);
CREATE POLICY "Users can add images to their logs" ON drink_log_images 
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM drink_logs WHERE id = drink_log_id
    )
  );

-- いいねテーブルのポリシー
CREATE POLICY "Anyone can view likes" ON likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like" ON likes 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can remove their likes" ON likes 
  FOR DELETE USING (auth.uid() = user_id);

-- インデックスの作成
CREATE INDEX idx_drink_logs_user ON drink_logs(user_id);
CREATE INDEX idx_drink_logs_establishment ON drink_logs(establishment_id);
CREATE INDEX idx_drink_log_images_log ON drink_log_images(drink_log_id);
CREATE INDEX idx_likes_log ON likes(drink_log_id);
CREATE INDEX idx_likes_user ON likes(user_id);

-- ストレージバケットの設定
INSERT INTO storage.buckets (id, name, public)
VALUES ('drink-log-images', 'drink-log-images', true)
ON CONFLICT (id) DO NOTHING;

-- ストレージポリシーの設定
CREATE POLICY "Images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'drink-log-images');

CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'drink-log-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'drink-log-images'
  AND auth.uid()::text = owner
);

-- 許可するMIMEタイプの設定
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'image/jpeg',
  'image/png',
  'image/gif'
]::text[]
WHERE id = 'drink-log-images';