-- メッセージテーブルの作成
CREATE TABLE location_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  image_url TEXT,
  mentions TEXT[] DEFAULT ARRAY[]::TEXT[],
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 通知テーブルの作成
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  type TEXT NOT NULL CHECK (type IN ('mention', 'system')),
  content TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックスの作成
CREATE INDEX idx_location_messages_location ON location_messages(location_id);
CREATE INDEX idx_location_messages_user ON location_messages(user_id);
CREATE INDEX idx_location_messages_expires ON location_messages(expires_at);
CREATE INDEX idx_location_messages_mentions ON location_messages USING GIN(mentions);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- RLSの有効化
ALTER TABLE location_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- メッセージのポリシー
CREATE POLICY "Anyone can view messages"
ON location_messages FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can send messages"
ON location_messages FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own messages"
ON location_messages FOR DELETE
USING (auth.uid() = user_id);

-- 通知のポリシー
CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
ON notifications FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id);

-- メンション処理の関数
CREATE OR REPLACE FUNCTION process_message_mentions()
RETURNS TRIGGER AS $$
BEGIN
  -- メンションされたユーザーに通知を作成
  IF array_length(NEW.mentions, 1) > 0 THEN
    INSERT INTO notifications (user_id, type, content, link)
    SELECT 
      u.id,
      'mention',
      format('%s があなたをメンションしました', (SELECT username FROM users WHERE id = NEW.user_id)),
      format('/locations/%s', NEW.location_id)
    FROM users u
    WHERE u.username = ANY(NEW.mentions);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- メンショントリガーの作成
CREATE TRIGGER on_message_mention
  AFTER INSERT ON location_messages
  FOR EACH ROW
  EXECUTE FUNCTION process_message_mentions();

-- 期限切れメッセージの削除関数
CREATE OR REPLACE FUNCTION cleanup_expired_messages()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM location_messages
  WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$;

-- 必要な権限の付与
GRANT ALL ON location_messages TO authenticated;
GRANT SELECT ON location_messages TO anon;
GRANT ALL ON notifications TO authenticated;