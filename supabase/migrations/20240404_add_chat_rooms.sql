-- チャットメッセージテーブル
CREATE TABLE location_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  mentions UUID[] DEFAULT ARRAY[]::UUID[],
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '4 hours'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 通知テーブル
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  message_id UUID NOT NULL REFERENCES location_messages(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('mention')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックスの作成
CREATE INDEX idx_location_messages_location ON location_messages(location_id);
CREATE INDEX idx_location_messages_user ON location_messages(user_id);
CREATE INDEX idx_location_messages_expires ON location_messages(expires_at);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_message ON notifications(message_id);

-- RLSの設定
ALTER TABLE location_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- メッセージのポリシー
CREATE POLICY "Anyone can view messages"
ON location_messages FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can send messages"
ON location_messages FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- 通知のポリシー
CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
ON notifications FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
USING (user_id = auth.uid());

-- 期限切れメッセージを削除する関数
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

-- メンション通知を作成する関数
CREATE OR REPLACE FUNCTION create_mention_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO notifications (user_id, message_id, type)
  SELECT 
    unnest(NEW.mentions),
    NEW.id,
    'mention'
  WHERE array_length(NEW.mentions, 1) > 0;
  
  RETURN NEW;
END;
$$;

-- メンション通知のトリガー
CREATE TRIGGER on_message_mentions
  AFTER INSERT ON location_messages
  FOR EACH ROW
  EXECUTE FUNCTION create_mention_notifications();