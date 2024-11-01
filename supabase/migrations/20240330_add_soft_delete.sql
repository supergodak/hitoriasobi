-- establishments テーブルに hidden フラグを追加
ALTER TABLE establishments
ADD COLUMN is_hidden BOOLEAN NOT NULL DEFAULT false;

-- 非表示フラグを考慮したビューを作成
CREATE VIEW active_establishments AS
SELECT *
FROM establishments
WHERE NOT is_hidden;

-- トレンド取得関数を更新
CREATE OR REPLACE FUNCTION get_trending_establishments(
  p_limit integer DEFAULT 10,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  location TEXT,
  smoking_status TEXT,
  district TEXT,
  comment_count BIGINT,
  like_count BIGINT,
  latest_activity TIMESTAMP WITH TIME ZONE
) 
SECURITY DEFINER
AS $$
WITH activity_stats AS (
  SELECT
    e.id,
    e.name,
    ST_AsText(e.location) as location,
    e.smoking_status,
    e.district,
    e.created_at,
    COUNT(DISTINCT c.id) as comment_count,
    COUNT(DISTINCT l.id) as like_count,
    GREATEST(
      e.created_at,
      COALESCE(MAX(c.created_at), e.created_at),
      COALESCE(MAX(l.created_at), e.created_at)
    ) as latest_activity
  FROM establishments e
  LEFT JOIN comments c ON e.id = c.store_id
  LEFT JOIN likes l ON e.id = l.store_id
  WHERE NOT e.is_hidden
  GROUP BY e.id, e.name, e.location, e.smoking_status, e.district, e.created_at
)
SELECT
  id,
  name,
  location,
  smoking_status,
  district,
  comment_count,
  like_count,
  latest_activity
FROM activity_stats
ORDER BY latest_activity DESC, like_count DESC, comment_count DESC
LIMIT p_limit
OFFSET p_offset;
$$ LANGUAGE sql STABLE;

-- 店舗を非表示にするポリシーを追加
CREATE POLICY "Enable hide for establishment creators" 
ON establishments FOR UPDATE 
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by AND (NOT OLD.is_hidden OR NEW.is_hidden));