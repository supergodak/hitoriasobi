-- いいねテーブルの外部キー制約を変更
ALTER TABLE likes 
DROP CONSTRAINT IF EXISTS likes_drink_log_id_fkey;

-- drink_log_id カラムを store_id にリネームし、型をUUIDに変更
ALTER TABLE likes 
RENAME COLUMN drink_log_id TO store_id;

ALTER TABLE likes
ALTER COLUMN store_id TYPE UUID USING store_id::UUID;

-- 新しい外部キー制約を追加
ALTER TABLE likes
ADD CONSTRAINT likes_store_id_fkey 
FOREIGN KEY (store_id) 
REFERENCES establishments(id) 
ON DELETE CASCADE;

-- インデックスの更新
DROP INDEX IF EXISTS idx_likes_log;
CREATE INDEX idx_likes_store ON likes(store_id);

-- RLSポリシーの更新
DROP POLICY IF EXISTS "Anyone can view likes" ON likes;
DROP POLICY IF EXISTS "Authenticated users can like" ON likes;
DROP POLICY IF EXISTS "Users can remove their likes" ON likes;

CREATE POLICY "Anyone can view likes" 
ON likes FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can like" 
ON likes FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can remove their likes" 
ON likes FOR DELETE 
USING (auth.uid() = user_id);