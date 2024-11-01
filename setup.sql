-- Reset schema
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create locations table
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location GEOMETRY(Point, 4326) NOT NULL,
  type TEXT CHECK (type IN ('camp', 'hotel', 'spot', 'shop')),
  district TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id),
  is_hidden BOOLEAN NOT NULL DEFAULT false
);

-- Create amenities table
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

-- Create spatial index
CREATE INDEX idx_locations_location ON locations USING GIST(location);
CREATE INDEX idx_locations_type ON locations(type);
CREATE INDEX idx_locations_district ON locations(district);
CREATE INDEX idx_amenities_location ON amenities(location_id);

-- Create function to find locations in bounds
CREATE OR REPLACE FUNCTION find_locations_in_bounds(
  min_lat double precision,
  min_lng double precision,
  max_lat double precision,
  max_lng double precision,
  location_type text DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  type TEXT,
  latitude double precision,
  longitude double precision,
  district TEXT,
  amenities JSON
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
    json_build_object(
      'has_shower', a.has_shower,
      'has_power', a.has_power,
      'has_parking', a.has_parking,
      'is_pet_friendly', a.is_pet_friendly,
      'has_wifi', a.has_wifi
    ) as amenities
  FROM locations l
  LEFT JOIN amenities a ON l.id = a.location_id
  WHERE 
    ST_Within(
      l.location,
      ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326)
    )
    AND NOT l.is_hidden
    AND (location_type IS NULL OR l.type = location_type);
END;
$$ LANGUAGE plpgsql STABLE;

-- Enable RLS
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for locations
CREATE POLICY "Anyone can view locations"
ON locations FOR SELECT
USING (NOT is_hidden);

CREATE POLICY "Authenticated users can create locations"
ON locations FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Location creators can update"
ON locations FOR UPDATE
USING (auth.uid() = created_by);

-- Create RLS policies for amenities
CREATE POLICY "Anyone can view amenities"
ON amenities FOR SELECT
USING (true);

CREATE POLICY "Location creators can manage amenities"
ON amenities FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM locations
    WHERE id = amenities.location_id
    AND created_by = auth.uid()
  )
);

-- Grant permissions
GRANT ALL ON locations TO authenticated;
GRANT SELECT ON locations TO anon;
GRANT ALL ON amenities TO authenticated;
GRANT SELECT ON amenities TO anon;