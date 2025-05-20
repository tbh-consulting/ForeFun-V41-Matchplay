-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS update_total_points ON scorecard_scores;
DROP FUNCTION IF EXISTS calculate_total_points();

-- Create function to calculate total points
CREATE OR REPLACE FUNCTION calculate_total_points()
RETURNS TRIGGER AS $$
DECLARE
  v_total_points integer;
BEGIN
  -- Calculate total points for the affected player
  SELECT COALESCE(SUM(points), 0) INTO v_total_points
  FROM scorecard_scores
  WHERE scorecard_id = COALESCE(NEW.scorecard_id, OLD.scorecard_id)
  AND player_id = COALESCE(NEW.player_id, OLD.player_id)
  AND points IS NOT NULL;

  -- Update the total points
  UPDATE scorecard_players
  SET total_points = v_total_points
  WHERE scorecard_id = COALESCE(NEW.scorecard_id, OLD.scorecard_id)
  AND player_id = COALESCE(NEW.player_id, OLD.player_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update total_points when scores change
CREATE TRIGGER update_total_points
AFTER INSERT OR UPDATE OR DELETE ON scorecard_scores
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