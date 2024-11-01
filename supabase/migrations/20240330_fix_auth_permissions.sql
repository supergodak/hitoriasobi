-- Drop existing policies
DROP POLICY IF EXISTS "establishments_select_policy" ON establishments;
DROP POLICY IF EXISTS "establishments_insert_policy" ON establishments;

-- Establishments: 閲覧は誰でも可能、作成は認証済みユーザーのみ
CREATE POLICY "establishments_select_policy"
ON establishments FOR SELECT
TO public
USING (true);

CREATE POLICY "establishments_insert_policy"
ON establishments FOR INSERT
TO authenticated
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);

-- Comments: 閲覧は誰でも可能、作成と削除は認証済みユーザーのみ
DROP POLICY IF EXISTS "comments_select_policy" ON comments;
DROP POLICY IF EXISTS "comments_insert_policy" ON comments;
DROP POLICY IF EXISTS "comments_delete_policy" ON comments;

CREATE POLICY "comments_select_policy"
ON comments FOR SELECT
TO public
USING (true);

CREATE POLICY "comments_insert_policy"
ON comments FOR INSERT
TO authenticated
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "comments_delete_policy"
ON comments FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Likes: 閲覧は誰でも可能、作成と削除は認証済みユーザーのみ
DROP POLICY IF EXISTS "likes_select_policy" ON likes;
DROP POLICY IF EXISTS "likes_insert_policy" ON likes;
DROP POLICY IF EXISTS "likes_delete_policy" ON likes;

CREATE POLICY "likes_select_policy"
ON likes FOR SELECT
TO public
USING (true);

CREATE POLICY "likes_insert_policy"
ON likes FOR INSERT
TO authenticated
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "likes_delete_policy"
ON likes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Kampai Now: 閲覧は誰でも可能、作成と削除は認証済みユーザーのみ
DROP POLICY IF EXISTS "kampai_select_policy" ON kampai_now;
DROP POLICY IF EXISTS "kampai_insert_policy" ON kampai_now;
DROP POLICY IF EXISTS "kampai_delete_policy" ON kampai_now;

CREATE POLICY "kampai_select_policy"
ON kampai_now FOR SELECT
TO public
USING (true);

CREATE POLICY "kampai_insert_policy"
ON kampai_now FOR INSERT
TO authenticated
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "kampai_delete_policy"
ON kampai_now FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Users: プロフィールの閲覧は誰でも可能、更新は本人のみ
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;

CREATE POLICY "users_select_policy"
ON users FOR SELECT
TO public
USING (true);

CREATE POLICY "users_update_policy"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id);