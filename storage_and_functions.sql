-- Step 1: ストレージバケットの作成
INSERT INTO storage.buckets (id, name, public, allowed_mime_types)
VALUES 
  ('drink-log-images', 'drink-log-images', true, ARRAY['image/jpeg', 'image/png']::text[]),
  ('comment-images', 'comment-images', true, ARRAY['image/jpeg', 'image/png']::text[]);

-- Step 2: ストレージポリシーの設定
CREATE POLICY "Images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id IN ('drink-log-images', 'comment-images'));

CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id IN ('drink-log-images', 'comment-images')
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
USING (
  bucket_id IN ('drink-log-images', 'comment-images')
  AND auth.uid() = (owner)::uuid
);

-- Step 3: 関数の作成
CREATE OR REPLACE FUNCTION find_nearby_establishments(
  lat double precision,
  lng double precision,
  radius_meters int DEFAULT 500
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  latitude double precision,
  longitude double precision,
  smoking_status TEXT,
  distance_meters double precision
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.name,
    ST_Y(e.location::geometry) as latitude,
    ST_X(e.location::geometry) as longitude,
    e.smoking_status,
    ST_Distance(
      e.location::geography,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
    ) as distance_meters
  FROM establishments e
  WHERE ST_DWithin(
    e.location::geography,
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
    radius_meters
  )
  ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql STABLE;

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
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID is required';
  END IF;

  SELECT created_at INTO v_last_kampai
  FROM kampai_now
  WHERE user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_last_kampai IS NOT NULL AND 
     v_last_kampai > CURRENT_TIMESTAMP - INTERVAL '15 seconds' THEN
    RAISE EXCEPTION 'Please wait before creating another kampai';
  END IF;

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