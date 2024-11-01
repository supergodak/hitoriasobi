-- Add unique constraint to email column
ALTER TABLE users 
ADD CONSTRAINT users_email_unique UNIQUE (email);

-- Add index for email lookups
CREATE INDEX IF NOT EXISTS idx_users_email 
ON users (email);