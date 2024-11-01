-- コメント画像用のストレージバケットを再作成
DROP POLICY IF EXISTS "Images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

DELETE FROM storage.buckets WHERE id = 'comment-images';

INSERT INTO storage.buckets (id, name, public, avif_autodetection)
VALUES ('comment-images', 'comment-images', true, false);

-- バケットの設定を更新
UPDATE storage.buckets
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png']::text[],
    file_size_limit = 2097152
WHERE id = 'comment-images';

-- ストレージポリシーを設定
CREATE POLICY "Images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'comment-images');

CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'comment-images' 
  AND auth.role() = 'authenticated'
  AND (CASE 
    WHEN RIGHT(name, 4) = '.jpg' THEN true 
    WHEN RIGHT(name, 5) = '.jpeg' THEN true
    WHEN RIGHT(name, 4) = '.png' THEN true
    ELSE false
  END)
);

CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'comment-images'
  AND auth.uid()::text = owner::text
);