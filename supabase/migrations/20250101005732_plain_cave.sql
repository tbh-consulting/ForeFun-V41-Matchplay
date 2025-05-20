-- Add total_points column to scorecard_players
ALTER TABLE scorecard_players
ADD COLUMN total_points integer DEFAULT 0;

-- Create index for better performance
CREATE INDEX idx_scorecard_players_total_points 
ON scorecard_players(total_points);

-- Create function to calculate and update total points
CREATE OR REPLACE FUNCTION update_total_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT and UPDATE
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    UPDATE scorecard_players
    SET total_points = (
      SELECT COALESCE(SUM(points), 0)
      FROM scorecard_scores
      WHERE scorecard_id = NEW.scorecard_id
      AND player_id = NEW.player_id
    )
    WHERE scorecard_id = NEW.scorecard_id
    AND player_id = NEW.player_id;
  END IF;

  -- Handle DELETE
  IF (TG_OP = 'DELETE') THEN
    UPDATE scorecard_players
    SET total_points = (
      SELECT COALESCE(SUM(points), 0)
      FROM scorecard_scores
      WHERE scorecard_id = OLD.scorecard_id
      AND player_id = OLD.player_id
    )
    WHERE scorecard_id = OLD.scorecard_id
    AND player_id = OLD.player_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update total when points change
CREATE TRIGGER update_player_total_points
AFTER INSERT OR UPDATE OF points OR DELETE
ON scorecard_scores
FOR EACH ROW
EXECUTE FUNCTION update_total_points();

-- Initialize existing totals
UPDATE scorecard_players sp
SET total_points = (
  SELECT COALESCE(SUM(points), 0)
  FROM scorecard_scores ss
  WHERE ss.scorecard_id = sp.scorecard_id
  AND ss.player_id = sp.player_id
);