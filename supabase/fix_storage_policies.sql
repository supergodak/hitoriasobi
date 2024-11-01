-- 既存のストレージポリシーを削除
DROP POLICY IF EXISTS "Images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- ストレージポリシーを修正して再作成
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