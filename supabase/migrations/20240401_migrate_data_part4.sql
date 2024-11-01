-- Step 1: Create temporary tables to store existing data
CREATE TEMP TABLE temp_likes AS
SELECT * FROM likes;

CREATE TEMP TABLE temp_comments AS
SELECT * FROM comments;

-- Step 2: Remove invalid references
DELETE FROM temp_likes tl
WHERE NOT EXISTS (
  SELECT 1 FROM locations l
  WHERE l.id = tl.store_id
);

DELETE FROM temp_comments tc
WHERE NOT EXISTS (
  SELECT 1 FROM locations l
  WHERE l.id = tc.store_id
);

-- Step 3: Clear existing tables
TRUNCATE TABLE likes CASCADE;
TRUNCATE TABLE comments CASCADE;

-- Step 4: Drop existing foreign key constraints
ALTER TABLE likes
DROP CONSTRAINT IF EXISTS likes_store_id_fkey;

ALTER TABLE comments
DROP CONSTRAINT IF EXISTS comments_store_id_fkey;

-- Step 5: Rename columns
ALTER TABLE likes
RENAME COLUMN store_id TO location_id;

ALTER TABLE comments
RENAME COLUMN store_id TO location_id;

-- Step 6: Add new foreign key constraints
ALTER TABLE likes
ADD CONSTRAINT likes_location_id_fkey 
  FOREIGN KEY (location_id) 
  REFERENCES locations(id) 
  ON DELETE CASCADE;

ALTER TABLE comments
ADD CONSTRAINT comments_location_id_fkey 
  FOREIGN KEY (location_id) 
  REFERENCES locations(id) 
  ON DELETE CASCADE;

-- Step 7: Migrate valid data back
INSERT INTO likes (id, user_id, location_id, created_at)
SELECT id, user_id, store_id, created_at
FROM temp_likes;

INSERT INTO comments (id, user_id, location_id, content, image_url, created_at)
SELECT id, user_id, store_id, content, image_url, created_at
FROM temp_comments;

-- Step 8: Update indexes
DROP INDEX IF EXISTS idx_likes_store;
DROP INDEX IF EXISTS idx_comments_store;

CREATE INDEX idx_likes_location ON likes(location_id);
CREATE INDEX idx_comments_location ON comments(location_id);

-- Step 9: Clean up temporary tables
DROP TABLE temp_likes;
DROP TABLE temp_comments;