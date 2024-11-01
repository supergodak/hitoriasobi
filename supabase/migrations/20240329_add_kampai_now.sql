-- カンパイなうテーブルの作成
CREATE TABLE kampai_now (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックスの作成
CREATE INDEX idx_kampai_now_establishment ON kampai_now(establishment_id);
CREATE INDEX idx_kampai_now_user ON kampai_now(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_kampai_now_expires ON kampai_now(expires_at);

-- RLSポリシーの設定
ALTER TABLE kampai_now ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view kampai_now"
ON kampai_now FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create kampai_now"
ON kampai_now FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' OR 
  (auth.role() = 'anon' AND is_anonymous = true)
);

-- 期限切れのカンパイなうを削除する関数
CREATE OR REPLACE FUNCTION cleanup_expired_kampai_now()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM kampai_now
  WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$;

-- 15秒後に期限切れになるようにカンパイなうを作成する関数
CREATE OR REPLACE FUNCTION create_kampai_now(
  p_establishment_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_is_anonymous BOOLEAN DEFAULT false
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  -- 同じユーザーの有効なカンパイなうがないか確認
  IF p_user_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM kampai_now
    WHERE user_id = p_user_id
    AND expires_at > CURRENT_TIMESTAMP
  ) THEN
    RAISE EXCEPTION 'User already has an active kampai';
  END IF;

  -- 新しいカンパイなうを作成
  INSERT INTO kampai_now (
    establishment_id,
    user_id,
    is_anonymous,
    expires_at
  )
  VALUES (
    p_establishment_id,
    p_user_id,
    p_is_anonymous,
    CURRENT_TIMESTAMP + INTERVAL '15 seconds'
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;