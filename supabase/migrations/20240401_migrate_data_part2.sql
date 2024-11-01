-- Step 1: Migrate existing activities data
WITH activity_locations AS (
  SELECT 
    a.id,
    l.type as location_type
  FROM activities a
  JOIN locations l ON l.id = a.location_id
  WHERE a.activity_type IS NULL
)
UPDATE activities a
SET activity_type = CASE
  WHEN al.location_type = 'camp' THEN 'camp'
  ELSE 'travel'
END
FROM activity_locations al
WHERE a.id = al.id;

-- Step 2: Set default activity type for remaining records
UPDATE activities
SET activity_type = 'other'
WHERE activity_type IS NULL;

-- Step 3: Clean up expired activities
DELETE FROM activities
WHERE expires_at < CURRENT_TIMESTAMP;