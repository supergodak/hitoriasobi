-- 既存のテーブルとトリガーを削除
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS drink_log_images;
DROP TABLE IF EXISTS drink_logs;
DROP TABLE IF EXISTS users;

-- ユーザーテーブル
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 飲みログテーブル
CREATE TABLE drink_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  location TEXT,
  store_name TEXT,
  smoking_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 飲みログ画像テーブル
CREATE TABLE drink_log_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  drink_log_id UUID NOT NULL REFERENCES drink_logs(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- いいねテーブル
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  drink_log_id UUID NOT NULL REFERENCES drink_logs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, drink_log_id)
);

-- コメントテーブル
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  drink_log_id UUID NOT NULL REFERENCES drink_logs(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックスの作成
CREATE INDEX idx_drink_logs_user_id ON drink_logs(user_id);
CREATE INDEX idx_drink_log_images_drink_log_id ON drink_log_images(drink_log_id);
CREATE INDEX idx_likes_drink_log_id ON likes(drink_log_id);
CREATE INDEX idx_comments_drink_log_id ON comments(drink_log_id);

-- Row Level Security (RLS) の設定
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE drink_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE drink_log_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- RLSポリシーの作成
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own data" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view all drink logs" ON drink_logs FOR SELECT USING (true);
CREATE POLICY "Users can insert their own drink logs" ON drink_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own drink logs" ON drink_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own drink logs" ON drink_logs FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view all drink log images" ON drink_log_images FOR SELECT USING (true);
CREATE POLICY "Users can insert their own drink log images" ON drink_log_images FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM drink_logs WHERE id = drink_log_id));
CREATE POLICY "Users can delete their own drink log images" ON drink_log_images FOR DELETE USING (auth.uid() = (SELECT user_id FROM drink_logs WHERE id = drink_log_id));

CREATE POLICY "Users can view all likes" ON likes FOR SELECT USING (true);
CREATE POLICY "Users can insert their own likes" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own likes" ON likes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view all comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can insert their own comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- メンション機能のための関数とトリガー
CREATE OR REPLACE FUNCTION process_mentions() RETURNS TRIGGER AS $$
DECLARE
    mentioned_user_id UUID;
BEGIN
    FOR mentioned_user_id IN
        SELECT id FROM users
        WHERE NEW.content ~ concat('@', username)
    LOOP
        -- ここでメンションの処理を行う（例：通知テーブルに挿入）
        -- 実際の通知システムはアプリケーションの要件に応じて実装してください
        RAISE NOTICE 'User % mentioned in content %', mentioned_user_id, NEW.content;
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER drink_log_mention_trigger
AFTER INSERT OR UPDATE ON drink_logs
FOR EACH ROW EXECUTE FUNCTION process_mentions();

CREATE TRIGGER comment_mention_trigger
AFTER INSERT OR UPDATE ON comments
FOR EACH ROW EXECUTE FUNCTION process_mentions();

-- ユーザー登録時のトリガー関数
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'username');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ユーザー登録時のトリガー
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLSポリシーを設定する関数
CREATE OR REPLACE FUNCTION setup_rls_policies()
RETURNS void AS $$
BEGIN
  -- テーブルのRLSポリシーを再作成
  -- Users
  DROP POLICY IF EXISTS "Users can view all users" ON users;
  DROP POLICY IF EXISTS "Users can insert their own data" ON users;
  DROP POLICY IF EXISTS "Users can update their own data" ON users;
  
  CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
  CREATE POLICY "Users can insert their own data" ON users FOR INSERT WITH CHECK (auth.uid() = id);
  CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid() = id);

  -- Drink Logs
  DROP POLICY IF EXISTS "Users can view all drink logs" ON drink_logs;
  DROP POLICY IF EXISTS "Users can insert their own drink logs" ON drink_logs;
  DROP POLICY IF EXISTS "Users can update their own drink logs" ON drink_logs;
  DROP POLICY IF EXISTS "Users can delete their own drink logs" ON drink_logs;
  
  CREATE POLICY "Users can view all drink logs" ON drink_logs FOR SELECT USING (true);
  CREATE POLICY "Users can insert their own drink logs" ON drink_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Users can update their own drink logs" ON drink_logs FOR UPDATE USING (auth.uid() = user_id);
  CREATE POLICY "Users can delete their own drink logs" ON drink_logs FOR DELETE USING (auth.uid() = user_id);

  -- Drink Log Images
  DROP POLICY IF EXISTS "Users can view all drink log images" ON drink_log_images;
  DROP POLICY IF EXISTS "Users can insert their own drink log images" ON drink_log_images;
  DROP POLICY IF EXISTS "Users can delete their own drink log images" ON drink_log_images;
  
  CREATE POLICY "Users can view all drink log images" ON drink_log_images FOR SELECT USING (true);
  CREATE POLICY "Users can insert their own drink log images" ON drink_log_images FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM drink_logs WHERE id = drink_log_id));
  CREATE POLICY "Users can delete their own drink log images" ON drink_log_images FOR DELETE USING (auth.uid() = (SELECT user_id FROM drink_logs WHERE id = drink_log_id));

  -- Likes
  DROP POLICY IF EXISTS "Users can view all likes" ON likes;
  DROP POLICY IF EXISTS "Users can insert their own likes" ON likes;
  DROP POLICY IF EXISTS "Users can delete their own likes" ON likes;
  
  CREATE POLICY "Users can view all likes" ON likes FOR SELECT USING (true);
  CREATE POLICY "Users can insert their own likes" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Users can delete their own likes" ON likes FOR DELETE USING (auth.uid() = user_id);

  -- Comments
  DROP POLICY IF EXISTS "Users can view all comments" ON comments;
  DROP POLICY IF EXISTS "Users can insert their own comments" ON comments;
  DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
  DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
  
  CREATE POLICY "Users can view all comments" ON comments FOR SELECT USING (true);
  CREATE POLICY "Users can insert their own comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Users can update their own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
  CREATE POLICY "Users can delete their own comments" ON comments FOR DELETE USING (auth.uid() = user_id);
END;
$$ LANGUAGE plpgsql;

-- ストレージのRLSポリシーを設定する関数
CREATE OR REPLACE FUNCTION setup_storage_policies()
RETURNS void AS $$
BEGIN
  -- ストレージバケットのRLSポリシーを再作成
  DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated insert access" ON storage.objects;
  DROP POLICY IF EXISTS "Allow individual delete access" ON storage.objects;

  CREATE POLICY "Allow public read access" ON storage.objects FOR SELECT USING (bucket_id = 'drink-log-images');
  CREATE POLICY "Allow authenticated insert access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'drink-log-images' AND auth.role() = 'authenticated');
  CREATE POLICY "Allow individual delete access" ON storage.objects FOR DELETE USING (bucket_id = 'drink-log-images' AND auth.uid() = owner);
END;
$$ LANGUAGE plpgsql;

-- ストレージバケットの作成（既に存在する場合はスキップ）
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM storage.buckets WHERE name = 'drink-log-images') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('drink-log-images', 'drink-log-images', true);
  END IF;
END $$;