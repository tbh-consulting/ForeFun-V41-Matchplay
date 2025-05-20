-- Drop existing function if it exists
DROP FUNCTION IF EXISTS update_all_best_scores();

-- Create new function to update best scores
CREATE OR REPLACE FUNCTION update_all_best_scores()
RETURNS void AS $$
BEGIN
  -- Update best_score for all users based on their total_gross_score
  UPDATE profiles p
  SET best_score = (
    SELECT MIN(sp.total_gross_score)
    FROM scorecard_players sp
    WHERE sp.player_id = p.id
    AND sp.total_gross_score > 0  -- Ignore invalid scores
  );
END;
$$ LANGUAGE plpgsql;

-- Create cron job extension if not exists
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Remove existing job if it exists
SELECT cron.unschedule('update-best-scores');

-- Schedule the new job to run daily at midnight UTC
SELECT cron.schedule(
  'update-best-scores',           -- Job name
  '0 0 * * *',                   -- Cron schedule (midnight UTC)
  'SELECT update_all_best_scores()'
);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION update_all_best_scores() TO postgres;

-- Run initial update
SELECT update_all_best_scores();