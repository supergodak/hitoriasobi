-- 安全のため、カスケードを使用して依存関係も含めて削除
-- ストレージバケットの中身を削除
DELETE FROM storage.objects WHERE bucket_id = 'drink-log-images';

-- 既存のテーブルデータを削除
TRUNCATE TABLE comments CASCADE;
TRUNCATE TABLE likes CASCADE;
TRUNCATE TABLE drink_log_images CASCADE;
TRUNCATE TABLE drink_logs CASCADE;
TRUNCATE TABLE users CASCADE;

-- 認証関連のテーブルをリセット
TRUNCATE auth.users CASCADE;
TRUNCATE auth.identities CASCADE;
TRUNCATE auth.sessions CASCADE;
TRUNCATE auth.refresh_tokens CASCADE;
TRUNCATE auth.mfa_factors CASCADE;
TRUNCATE auth.mfa_challenges CASCADE;
TRUNCATE auth.mfa_amr_claims CASCADE;

-- ストレージバケットを再作成
DELETE FROM storage.buckets WHERE id = 'drink-log-images';
INSERT INTO storage.buckets (id, name, public) VALUES ('drink-log-images', 'drink-log-images', true);

-- シーケンスをリセット
ALTER SEQUENCE IF EXISTS comments_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS likes_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS drink_logs_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS users_id_seq RESTART WITH 1;

-- RLSポリシーを再適用
SELECT setup_rls_policies();
SELECT setup_storage_policies();