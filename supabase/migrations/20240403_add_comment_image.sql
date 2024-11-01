-- Add image_url column to camp_log_comments table
ALTER TABLE camp_log_comments
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update RLS policies to include image_url
DROP POLICY IF EXISTS "Users can add comments to camp logs" ON camp_log_comments;

CREATE POLICY "Users can add comments to camp logs"
ON camp_log_comments FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  (image_url IS NULL OR image_url ~ '^https?://.*')
);