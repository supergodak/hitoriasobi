-- Step 1: Drop existing foreign key constraint if exists
ALTER TABLE activities
DROP CONSTRAINT IF EXISTS activities_establishment_id_fkey;

-- Step 2: Rename establishment_id column to location_id
ALTER TABLE activities
RENAME COLUMN establishment_id TO location_id;

-- Step 3: Add new foreign key constraint
ALTER TABLE activities
ADD CONSTRAINT activities_location_id_fkey
FOREIGN KEY (location_id)
REFERENCES locations(id)
ON DELETE CASCADE;

-- Step 4: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_activities_location
ON activities(location_id);

-- Step 5: Clean up any orphaned records
DELETE FROM activities a
WHERE NOT EXISTS (
  SELECT 1 FROM locations l
  WHERE l.id = a.location_id
);

-- Step 6: Add NOT NULL constraint
ALTER TABLE activities
ALTER COLUMN location_id SET NOT NULL;