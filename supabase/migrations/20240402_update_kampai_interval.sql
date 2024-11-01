-- カンパイなうの作成関数を更新（投稿間隔を1分に変更）
CREATE OR REPLACE FUNCTION create_kampai_now(
  p_establishment_id UUID,
  p_user_id UUID,
  p_is_anonymous BOOLEAN DEFAULT false
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
  v_last_kampai TIMESTAMP WITH TIME ZONE;
BEGIN
  -- ユーザーIDが必須
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID is required';
  END IF;

  -- 同じユーザーの最後のカンパイなうを確認
  SELECT created_at INTO v_last_kampai
  FROM kampai_now
  WHERE user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT 1;

  -- 1分以内の再投稿をチェック
  IF v_last_kampai IS NOT NULL AND 
     v_last_kampai > CURRENT_TIMESTAMP - INTERVAL '1 minute' THEN
    RAISE EXCEPTION 'Please wait before creating another kampai';
  END IF;

  -- 新しいカンパイなうを作成（30分で期限切れ）
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
    CURRENT_TIMESTAMP + INTERVAL '30 minutes'
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;