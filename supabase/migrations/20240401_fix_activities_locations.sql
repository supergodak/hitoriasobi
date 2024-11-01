-- Step 1: Drop existing foreign key if exists
ALTER TABLE activities
DROP CONSTRAINT IF EXISTS activities_location_id_fkey;

-- Step 2: Add new foreign key constraint
ALTER TABLE activities
ADD CONSTRAINT activities_location_id_fkey
FOREIGN KEY (location_id)
REFERENCES locations(id)
ON DELETE CASCADE;

-- Step 3: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_activities_location
ON activities(location_id);

-- Step 4: Clean up any orphaned records
DELETE FROM activities a
WHERE NOT EXISTS (
  SELECT 1 FROM locations l
  WHERE l.id = a.location_id
);