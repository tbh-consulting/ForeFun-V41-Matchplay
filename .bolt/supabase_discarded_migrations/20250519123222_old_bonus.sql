/*
  # Fix Team Points Calculation

  1. Changes
    - Update the update_team_total_points function to correctly calculate total points
    - Recalculate total_points for all existing teams
    - Ensure points are properly summed from scorecard_team_scores

  2. Impact
    - Teams.total_points will now correctly reflect the sum of all points values
    - Existing data will be fixed by the migration
*/

-- Fix the team total points calculation function
CREATE OR REPLACE FUNCTION update_team_total_points()
RETURNS TRIGGER AS $$
DECLARE
  v_scorecard_id uuid;
  team_rec RECORD;
BEGIN
  -- Get the scorecard ID based on operation type
  IF TG_OP = 'DELETE' THEN
    v_scorecard_id := OLD.scorecard_id;
  ELSE
    v_scorecard_id := NEW.scorecard_id;
  END IF;
  
  -- Update total_points for ALL teams in this scorecard
  FOR team_rec IN (
    SELECT DISTINCT team_id
    FROM scorecard_team_scores
    WHERE scorecard_id = v_scorecard_id
  ) LOOP
    UPDATE teams
    SET total_points = (
      SELECT COALESCE(SUM(points), 0)
      FROM scorecard_team_scores
      WHERE team_id = team_rec.team_id
        AND points IS NOT NULL
    )
    WHERE id = team_rec.team_id;
  END LOOP;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_team_total_points ON scorecard_team_scores;

-- Create trigger to update total_points when points change
CREATE TRIGGER update_team_total_points
  AFTER INSERT OR UPDATE OF points OR DELETE
  ON scorecard_team_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_team_total_points();

-- Recalculate total_points for all existing teams
DO $$
DECLARE
  team_rec RECORD;
BEGIN
  FOR team_rec IN (
    SELECT id
    FROM teams
  ) LOOP
    UPDATE teams
    SET total_points = (
      SELECT COALESCE(SUM(points), 0)
      FROM scorecard_team_scores
      WHERE team_id = team_rec.id
        AND points IS NOT NULL
    )
    WHERE id = team_rec.id;
  END LOOP;
END;
$$;