-- Step 1: Migrate existing smoking_status data to type
UPDATE locations
SET type = CASE
  WHEN district LIKE '%キャンプ場%' THEN 'camp'
  WHEN district LIKE '%ホテル%' OR district LIKE '%旅館%' THEN 'hotel'
  ELSE 'spot'
END
WHERE type IS NULL;

-- Step 2: Create default amenities for existing locations
INSERT INTO amenities (location_id)
SELECT id FROM locations l
WHERE NOT EXISTS (
  SELECT 1 FROM amenities a WHERE a.location_id = l.id
);