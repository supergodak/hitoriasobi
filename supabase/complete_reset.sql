-- 認証関連のテーブルをリセット
TRUNCATE auth.users CASCADE;
TRUNCATE auth.identities CASCADE;
TRUNCATE auth.sessions CASCADE;
TRUNCATE auth.refresh_tokens CASCADE;
TRUNCATE auth.mfa_factors CASCADE;
TRUNCATE auth.mfa_amr_claims CASCADE;
TRUNCATE auth.mfa_challenges CASCADE;

-- 依存関係を含むすべてのオブジェクトを削除
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

[Previous content remains the same...]