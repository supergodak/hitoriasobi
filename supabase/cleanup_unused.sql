-- 不要なテーブルを削除
DROP TABLE IF EXISTS drink_log_images CASCADE;
DROP TABLE IF EXISTS drink_logs CASCADE;

-- 不要な関数を削除
DROP FUNCTION IF EXISTS extract_hour_immutable(timestamp with time zone);
DROP FUNCTION IF EXISTS get_recommended_logs(uuid);
DROP FUNCTION IF EXISTS process_mentions();

-- 不要なトリガーを削除
DROP TRIGGER IF EXISTS drink_log_mention_trigger ON drink_logs;
DROP TRIGGER IF EXISTS comment_mention_trigger ON comments;