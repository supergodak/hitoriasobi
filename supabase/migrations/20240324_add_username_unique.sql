-- Add unique constraint to username column
ALTER TABLE users 
ADD CONSTRAINT users_username_unique UNIQUE (username);

-- Add index for username lookups
CREATE INDEX IF NOT EXISTS idx_users_username 
ON users (username);