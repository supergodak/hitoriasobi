-- Step 1: Drop old functions
DROP FUNCTION IF EXISTS find_nearby_establishments(double precision, double precision, integer);
DROP FUNCTION IF EXISTS create_kampai_now(uuid, uuid, boolean);
DROP FUNCTION IF EXISTS get_recommended_logs(uuid);
DROP FUNCTION IF EXISTS extract_hour_immutable(timestamp with time zone);

-- Step 2: Drop old triggers
DROP TRIGGER IF EXISTS drink_log_mention_trigger ON drink_logs;
DROP TRIGGER IF EXISTS comment_mention_trigger ON comments;

-- Step 3: Drop unused functions
DROP FUNCTION IF EXISTS process_mentions();
DROP FUNCTION IF EXISTS cleanup_expired_kampai_now();

-- Step 4: Create new cleanup function for activities
CREATE OR REPLACE FUNCTION cleanup_expired_activities()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM activities
  WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$;