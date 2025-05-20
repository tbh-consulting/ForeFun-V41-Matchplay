-- Create function to update best scores
CREATE OR REPLACE FUNCTION update_all_best_scores()
RETURNS void AS $$
BEGIN
  -- Update best_score for all users based on their completed rounds
  UPDATE profiles p
  SET best_score = (
    SELECT MIN(sp.total_gross_score)
    FROM scorecard_players sp
    JOIN scorecards s ON s.id = sp.scorecard_id
    WHERE sp.player_id = p.id
    AND s.completed_at IS NOT NULL
    AND sp.total_gross_score > 0
  );
END;
$$ LANGUAGE plpgsql;

-- Create cron job extension if not exists
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the job to run daily at midnight UTC
SELECT cron.schedule(
  'update-best-scores',           -- Job name
  '0 0 * * *',                   -- Cron schedule (midnight UTC)
  'SELECT update_all_best_scores()'
);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION update_all_best_scores() TO postgres;

-- Run initial update
SELECT update_all_best_scores();