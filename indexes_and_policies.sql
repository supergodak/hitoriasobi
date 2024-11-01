-- Step 1: インデックスの作成
CREATE INDEX idx_establishments_location ON establishments USING GIST(location);
CREATE INDEX idx_comments_store ON comments(store_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_likes_store ON likes(store_id);
CREATE INDEX idx_likes_user ON likes(user_id);
CREATE INDEX idx_kampai_now_establishment ON kampai_now(establishment_id);
CREATE INDEX idx_kampai_now_user ON kampai_now(user_id);
CREATE INDEX idx_kampai_now_expires ON kampai_now(expires_at);

-- Step 2: RLSの有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE kampai_now ENABLE ROW LEVEL SECURITY;

-- Step 3: RLSポリシーの設定
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view establishments" ON establishments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create establishments" ON establishments 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON comments 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can delete their own comments" ON comments 
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view likes" ON likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like" ON likes 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can remove their likes" ON likes 
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view kampai_now" ON kampai_now FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create kampai_now" ON kampai_now 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can delete their own kampai" ON kampai_now 
  FOR DELETE USING (auth.uid() = user_id);