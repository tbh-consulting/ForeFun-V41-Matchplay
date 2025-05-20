-- Create function to calculate total points
CREATE OR REPLACE FUNCTION calculate_total_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total_points for the affected player
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

  RETURN NEW;
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