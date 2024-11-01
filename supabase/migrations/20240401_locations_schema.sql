-- Step 1: Rename establishments table to locations
ALTER TABLE establishments 
RENAME TO locations;

-- Step 2: Add new columns to locations table
ALTER TABLE locations
ADD COLUMN type TEXT CHECK (type IN ('camp', 'hotel', 'spot', 'shop')),
ADD COLUMN is_hidden BOOLEAN NOT NULL DEFAULT false;

-- Step 3: Create amenities table
CREATE TABLE amenities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  has_shower BOOLEAN NOT NULL DEFAULT false,
  has_power BOOLEAN NOT NULL DEFAULT false,
  has_parking BOOLEAN NOT NULL DEFAULT false,
  is_pet_friendly BOOLEAN NOT NULL DEFAULT false,
  has_wifi BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 4: Create indexes
CREATE INDEX idx_locations_type ON locations(type);
CREATE INDEX idx_locations_district ON locations(district);
CREATE INDEX idx_amenities_location ON amenities(location_id);

-- Step 5: Rename kampai_now table to activities and update its structure
ALTER TABLE kampai_now RENAME TO activities;
ALTER TABLE activities RENAME COLUMN establishment_id TO location_id;
ALTER TABLE activities ADD COLUMN activity_type TEXT CHECK (activity_type IN ('camp', 'travel', 'other'));
ALTER TABLE activities ALTER COLUMN expires_at SET DEFAULT CURRENT_TIMESTAMP + INTERVAL '30 minutes';

-- Step 6: Update foreign key constraint for activities
ALTER TABLE activities 
DROP CONSTRAINT IF EXISTS kampai_now_establishment_id_fkey,
ADD CONSTRAINT activities_location_id_fkey 
  FOREIGN KEY (location_id) 
  REFERENCES locations(id) 
  ON DELETE CASCADE;

-- Step 7: Update RLS policies
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Locations policies
CREATE POLICY "Enable read access for all users"
ON locations FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON locations FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for location creators"
ON locations FOR UPDATE
USING (auth.uid() = created_by);

-- Amenities policies
CREATE POLICY "Enable read access for all users"
ON amenities FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON amenities FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM locations
    WHERE id = amenities.location_id
    AND created_by = auth.uid()
  )
);

CREATE POLICY "Enable update for location creators"
ON amenities FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM locations
    WHERE id = amenities.location_id
    AND created_by = auth.uid()
  )
);

-- Activities policies
CREATE POLICY "Enable read access for all users"
ON activities FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON activities FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for activity creators"
ON activities FOR DELETE
USING (auth.uid() = user_id);

-- Step 8: Create functions for location search
CREATE OR REPLACE FUNCTION find_nearby_locations(
  lat double precision,
  lng double precision,
  radius_meters int DEFAULT 500,
  location_type text DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  type TEXT,
  latitude double precision,
  longitude double precision,
  district TEXT,
  distance_meters double precision
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.name,
    l.type,
    ST_Y(l.location::geometry) as latitude,
    ST_X(l.location::geometry) as longitude,
    l.district,
    ST_Distance(
      l.location::geography,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
    ) as distance_meters
  FROM locations l
  WHERE 
    ST_DWithin(
      l.location::geography,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
      radius_meters
    )
    AND (location_type IS NULL OR l.type = location_type)
    AND NOT l.is_hidden
  ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql STABLE;