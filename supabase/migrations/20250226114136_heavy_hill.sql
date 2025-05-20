-- Drop existing trigger and function
DROP TRIGGER IF EXISTS update_total_points ON scorecard_scores;
DROP FUNCTION IF EXISTS calculate_total_points();

-- Create function to calculate total points
CREATE OR REPLACE FUNCTION calculate_total_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT and UPDATE
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    UPDATE scorecard_players sp
    SET total_points = (
      SELECT COALESCE(SUM(points), 0)
      FROM scorecard_scores ss
      WHERE ss.scorecard_id = sp.scorecard_id
      AND ss.player_id = sp.player_id
      AND ss.points IS NOT NULL
    )
    WHERE scorecard_id = NEW.scorecard_id
    AND player_id = NEW.player_id;
  END IF;

  -- Handle DELETE
  IF (TG_OP = 'DELETE') THEN
    UPDATE scorecard_players sp
    SET total_points = (
      SELECT COALESCE(SUM(points), 0)
      FROM scorecard_scores ss
      WHERE ss.scorecard_id = sp.scorecard_id
      AND ss.player_id = sp.player_id
      AND ss.points IS NOT NULL
    )
    WHERE scorecard_id = OLD.scorecard_id
    AND player_id = OLD.player_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update total_points when scores change
CREATE TRIGGER update_total_points
AFTER INSERT OR UPDATE OF points OR DELETE
ON scorecard_scores
FOR EACH ROW
EXECUTE FUNCTION calculate_total_points();

-- Initialize total_points for existing records
UPDATE scorecard_players sp
SET total_points = (
  SELECT COALESCE(SUM(points), 0)
  FROM scorecard_scores ss
  WHERE ss.scorecard_id = sp.scorecard_id
  AND ss.player_id = sp.player_id
  AND ss.points IS NOT NULL
);