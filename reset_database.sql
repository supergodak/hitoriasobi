-- 既存のデータを削除
TRUNCATE TABLE comments CASCADE;
TRUNCATE TABLE likes CASCADE;
TRUNCATE TABLE drink_logs CASCADE;
TRUNCATE TABLE users CASCADE;

-- auth.users テーブルもリセット（注意: これはSupabaseの認証システムに影響します）
TRUNCATE TABLE auth.users CASCADE;

-- 認証関連のテーブルもリセット
TRUNCATE TABLE auth.users CASCADE;
TRUNCATE TABLE auth.identities CASCADE;
TRUNCATE TABLE auth.sessions CASCADE;
TRUNCATE TABLE auth.refresh_tokens CASCADE;