-- Storage policies for drink-log-images bucket
CREATE OR REPLACE FUNCTION setup_storage_policies()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated insert access" ON storage.objects;
  DROP POLICY IF EXISTS "Allow individual delete access" ON storage.objects;

  -- Create new policies
  CREATE POLICY "Allow public read access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'drink-log-images');

  CREATE POLICY "Allow authenticated insert access"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'drink-log-images'
      AND auth.role() = 'authenticated'
    );

  CREATE POLICY "Allow individual delete access"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'drink-log-images'
      AND auth.uid() = owner
    );
END;
$$;

-- Execute the function to apply policies
SELECT setup_storage_policies();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- Update bucket configuration to allow specific MIME types
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'image/jpeg',
  'image/png',
  'image/gif'
]::text[]
WHERE id = 'drink-log-images';