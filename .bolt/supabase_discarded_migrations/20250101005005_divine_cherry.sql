-- Create function to update best_score in profiles
CREATE OR REPLACE FUNCTION update_best_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if this is a completed scorecard
  IF EXISTS (
    SELECT 1 FROM scorecards 
    WHERE id = NEW.scorecard_id 
    AND completed_at IS NOT NULL
  ) THEN
    -- Update best_score if this is a better score or there isn't one yet
    UPDATE profiles
    SET best_score = LEAST(
      COALESCE(best_score, NEW.total_gross_score),
      NEW.total_gross_score
    )
    WHERE id = NEW.player_id
    AND (
      best_score IS NULL 
      OR NEW.total_gross_score < best_score
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update best_score when total_gross_score changes
CREATE TRIGGER update_player_best_score
AFTER UPDATE OF total_gross_score
ON scorecard_players
FOR EACH ROW
EXECUTE FUNCTION update_best_score();

-- Initialize best scores from existing completed scorecards
UPDATE profiles p
SET best_score = (
  SELECT MIN(sp.total_gross_score)
  FROM scorecard_players sp
  JOIN scorecards s ON s.id = sp.scorecard_id
  WHERE sp.player_id = p.id
  AND s.completed_at IS NOT NULL
  AND sp.total_gross_score > 0
);