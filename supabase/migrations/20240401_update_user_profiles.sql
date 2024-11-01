-- Step 1: Add new columns to users table if they don't exist
DO $$ 
BEGIN
  -- Add preferred_activities column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'preferred_activities'
  ) THEN
    ALTER TABLE users
    ADD COLUMN preferred_activities TEXT[] DEFAULT ARRAY[]::TEXT[];
  END IF;

  -- Add bio column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'bio'
  ) THEN
    ALTER TABLE users
    ADD COLUMN bio TEXT;
  END IF;

  -- Add avatar_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE users
    ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- Step 2: Create index for preferred activities if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'users' AND indexname = 'idx_users_preferred_activities'
  ) THEN
    CREATE INDEX idx_users_preferred_activities ON users USING GIN(preferred_activities);
  END IF;
END $$;

-- Step 3: Update RLS policies for user profiles
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable update for users based on id" ON users;
DROP POLICY IF EXISTS "Enable update for own profile" ON users;

CREATE POLICY "Enable read access for all users"
ON users FOR SELECT
USING (true);

CREATE POLICY "Enable update for own profile"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  CASE
    WHEN preferred_activities IS NOT NULL THEN
      array_length(preferred_activities, 1) <= 5 AND
      preferred_activities <@ ARRAY['camp', 'travel', 'hiking', 'photography', 'fishing']::TEXT[]
    ELSE true
  END
);