-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view amenities" ON amenities;
DROP POLICY IF EXISTS "Location creators can manage amenities" ON amenities;

-- Enable RLS
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "amenities_select_policy"
ON amenities FOR SELECT
TO public
USING (true);

CREATE POLICY "amenities_insert_policy"
ON amenities FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM locations
    WHERE id = amenities.location_id
    AND created_by = auth.uid()
  )
);

CREATE POLICY "amenities_update_policy"
ON amenities FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM locations
    WHERE id = amenities.location_id
    AND created_by = auth.uid()
  )
);

CREATE POLICY "amenities_delete_policy"
ON amenities FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM locations
    WHERE id = amenities.location_id
    AND created_by = auth.uid()
  )
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

GRANT ALL ON amenities TO authenticated;
GRANT SELECT ON amenities TO anon;