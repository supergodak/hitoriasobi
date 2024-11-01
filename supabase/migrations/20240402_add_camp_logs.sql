-- Create camp_logs table if not exists
CREATE TABLE IF NOT EXISTS camp_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  location_id UUID NOT NULL REFERENCES locations(id),
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create camp_log_images table if not exists
CREATE TABLE IF NOT EXISTS camp_log_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  camp_log_id UUID NOT NULL REFERENCES camp_logs(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create camp_log_comments table if not exists
CREATE TABLE IF NOT EXISTS camp_log_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  camp_log_id UUID NOT NULL REFERENCES camp_logs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE camp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE camp_log_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE camp_log_comments ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_camp_logs_user ON camp_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_camp_logs_location ON camp_logs(location_id);
CREATE INDEX IF NOT EXISTS idx_camp_log_images_log ON camp_log_images(camp_log_id);
CREATE INDEX IF NOT EXISTS idx_camp_log_comments_log ON camp_log_comments(camp_log_id);
CREATE INDEX IF NOT EXISTS idx_camp_log_comments_user ON camp_log_comments(user_id);

-- Camp logs policies
CREATE POLICY "Enable read access for all users"
ON camp_logs FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON camp_logs FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for own logs"
ON camp_logs FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for own logs"
ON camp_logs FOR DELETE
USING (auth.uid() = user_id);

-- Camp log images policies
CREATE POLICY "Enable read access for all users"
ON camp_log_images FOR SELECT
USING (true);

CREATE POLICY "Enable insert for log owners"
ON camp_log_images FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM camp_logs
    WHERE id = camp_log_images.camp_log_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Enable delete for log owners"
ON camp_log_images FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM camp_logs
    WHERE id = camp_log_images.camp_log_id
    AND user_id = auth.uid()
  )
);

-- Camp log comments policies
CREATE POLICY "Enable read access for all users"
ON camp_log_comments FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON camp_log_comments FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for own comments"
ON camp_log_comments FOR DELETE
USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON camp_logs TO authenticated;
GRANT SELECT ON camp_logs TO anon;

GRANT ALL ON camp_log_images TO authenticated;
GRANT SELECT ON camp_log_images TO anon;

GRANT ALL ON camp_log_comments TO authenticated;
GRANT SELECT ON camp_log_comments TO anon;