-- Step 1: トリガーと関数の削除
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS create_kampai_now(uuid, uuid, boolean) CASCADE;
DROP FUNCTION IF EXISTS find_nearby_establishments(double precision, double precision, int) CASCADE;
DROP FUNCTION IF EXISTS extract_hour_immutable(timestamp with time zone) CASCADE;
DROP FUNCTION IF EXISTS get_recommended_logs(uuid) CASCADE;
DROP FUNCTION IF EXISTS setup_storage_policies() CASCADE;
DROP FUNCTION IF EXISTS process_mentions() CASCADE;
DROP FUNCTION IF EXISTS cleanup_expired_kampai_now() CASCADE;

-- Step 2: ストレージの削除
DROP POLICY IF EXISTS "Images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
DELETE FROM storage.objects WHERE bucket_id IN ('drink-log-images', 'comment-images');
DELETE FROM storage.buckets WHERE id IN ('drink-log-images', 'comment-images');

-- Step 3: テーブルの削除
DROP TABLE IF EXISTS kampai_now CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS drink_log_images CASCADE;
DROP TABLE IF EXISTS drink_logs CASCADE;
DROP TABLE IF EXISTS establishments CASCADE;
DROP TABLE IF EXISTS users CASCADE;