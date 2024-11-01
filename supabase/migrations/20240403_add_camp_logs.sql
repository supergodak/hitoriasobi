-- キャンプログテーブルの作成
CREATE TABLE camp_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  location_id UUID NOT NULL REFERENCES locations(id),
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- キャンプログ画像テーブルの作成
CREATE TABLE camp_log_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  camp_log_id UUID NOT NULL REFERENCES camp_logs(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- キャンプログコメントテーブルの作成
CREATE TABLE camp_log_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  camp_log_id UUID NOT NULL REFERENCES camp_logs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックスの作成
CREATE INDEX idx_camp_logs_user ON camp_logs(user_id);
CREATE INDEX idx_camp_logs_location ON camp_logs(location_id);
CREATE INDEX idx_camp_logs_created ON camp_logs(created_at DESC);
CREATE INDEX idx_camp_log_images_log ON camp_log_images(camp_log_id);
CREATE INDEX idx_camp_log_comments_log ON camp_log_comments(camp_log_id);

-- RLSの設定
ALTER TABLE camp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE camp_log_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE camp_log_comments ENABLE ROW LEVEL SECURITY;

-- キャンプログのポリシー
CREATE POLICY "Anyone can view camp logs"
ON camp_logs FOR SELECT
USING (true);

CREATE POLICY "Users can create their own camp logs"
ON camp_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 画像のポリシー
CREATE POLICY "Anyone can view camp log images"
ON camp_log_images FOR SELECT
USING (true);

CREATE POLICY "Users can add images to camp logs"
ON camp_log_images FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- コメントのポリシー
CREATE POLICY "Anyone can view camp log comments"
ON camp_log_comments FOR SELECT
USING (true);

CREATE POLICY "Users can add comments to camp logs"
ON camp_log_comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON camp_log_comments FOR DELETE
USING (auth.uid() = user_id);

-- ストレージバケットの作成（既存の場合はスキップ）
INSERT INTO storage.buckets (id, name, public, allowed_mime_types)
VALUES (
  'camp-log-images',
  'camp-log-images',
  true,
  ARRAY['image/jpeg', 'image/png']::text[]
)
ON CONFLICT (id) DO UPDATE
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png']::text[];

-- ストレージポリシーの設定（既存のポリシーを削除してから作成）
DO $$
BEGIN
  -- 既存のポリシーを削除
  DROP POLICY IF EXISTS "Camp log images are publicly accessible" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload camp log images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own camp log images" ON storage.objects;

  -- 新しいポリシーを作成
  CREATE POLICY "Camp log images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'camp-log-images');

  CREATE POLICY "Authenticated users can upload camp log images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'camp-log-images'
    AND auth.role() = 'authenticated'
  );

  CREATE POLICY "Users can delete their own camp log images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'camp-log-images'
    AND auth.uid()::uuid = owner::uuid
  );
END
$$;