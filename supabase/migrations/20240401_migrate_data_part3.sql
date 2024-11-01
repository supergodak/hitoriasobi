-- Step 1: Update likes table to reference locations
ALTER TABLE likes
RENAME COLUMN store_id TO location_id;

-- Step 2: Update comments table to reference locations
ALTER TABLE comments
RENAME COLUMN store_id TO location_id;

-- Step 3: Update foreign key constraints
ALTER TABLE likes
DROP CONSTRAINT IF EXISTS likes_store_id_fkey,
ADD CONSTRAINT likes_location_id_fkey 
  FOREIGN KEY (location_id) 
  REFERENCES locations(id) 
  ON DELETE CASCADE;

ALTER TABLE comments
DROP CONSTRAINT IF EXISTS comments_store_id_fkey,
ADD CONSTRAINT comments_location_id_fkey 
  FOREIGN KEY (location_id) 
  REFERENCES locations(id) 
  ON DELETE CASCADE;

-- Step 4: Update indexes
DROP INDEX IF EXISTS idx_likes_store;
DROP INDEX IF EXISTS idx_comments_store;

CREATE INDEX idx_likes_location ON likes(location_id);
CREATE INDEX idx_comments_location ON comments(location_id);