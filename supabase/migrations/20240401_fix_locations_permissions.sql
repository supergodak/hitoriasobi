-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON locations;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON locations;
DROP POLICY IF EXISTS "Enable update for location creators" ON locations;

-- Enable RLS
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "locations_select_policy"
ON locations FOR SELECT
TO public
USING (true);

CREATE POLICY "locations_insert_policy"
ON locations FOR INSERT
TO authenticated
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "locations_update_policy"
ON locations FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

GRANT ALL ON locations TO authenticated;
GRANT SELECT ON locations TO anon;

-- Create view for public access
CREATE OR REPLACE VIEW public_locations AS
SELECT 
  l.*,
  a.has_shower,
  a.has_power,
  a.has_parking,
  a.is_pet_friendly,
  a.has_wifi
FROM locations l
LEFT JOIN amenities a ON l.id = a.location_id
WHERE NOT l.is_hidden;