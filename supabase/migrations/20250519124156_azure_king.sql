/*
  # Fix Team Total Points Calculation

  1. Changes
     - Improves the update_team_total_points function to update all teams in a scorecard
     - Ensures total_points is recalculated whenever any score changes, not just when points change
     - Fixes the issue where team total points weren't being properly updated
  
  2. Impact
     - Teams.total_points will now correctly reflect the sum of all points from scorecard_team_scores
     - Points will be updated in real-time as scores change
     - Existing data will be fixed by the migration
*/

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_team_total_points ON scorecard_team_scores;
DROP FUNCTION IF EXISTS update_team_total_points();

-- Create improved function to update team total points
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

-- Create trigger to update total_points when ANY change happens to scorecard_team_scores
-- This ensures points are recalculated even when gross_score changes (which affects points)
CREATE TRIGGER update_team_total_points
  AFTER INSERT OR UPDATE OR DELETE
  ON scorecard_team_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_team_total_points();

-- Recalculate total_points for all existing teams
UPDATE teams
SET total_points = (
  SELECT COALESCE(SUM(points), 0)
  FROM scorecard_team_scores
  WHERE team_id = teams.id
    AND points IS NOT NULL
);

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_team_total_points TO authenticated;