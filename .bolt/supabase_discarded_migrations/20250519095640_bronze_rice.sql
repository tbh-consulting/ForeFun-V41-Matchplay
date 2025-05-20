-- Drop existing function and trigger to start fresh
DROP TRIGGER IF EXISTS update_all_teams_match_play ON scorecard_team_scores;
DROP FUNCTION IF EXISTS update_all_teams_match_play_total();

-- Create a SIMPLE function that updates ALL teams in a scorecard
CREATE OR REPLACE FUNCTION update_all_teams_match_play_total()
RETURNS TRIGGER AS $$
DECLARE
  v_scorecard_id uuid;
BEGIN
  -- Get the scorecard ID based on operation type
  IF TG_OP = 'DELETE' THEN
    v_scorecard_id := OLD.scorecard_id;
  ELSE
    v_scorecard_id := NEW.scorecard_id;
  END IF;
  
  -- Update ALL teams with this scorecard_id in a single operation
  UPDATE teams
  SET match_play_total = (
    SELECT COALESCE(SUM(sts.match_play_status), 0)
    FROM scorecard_team_scores sts
    WHERE sts.team_id = teams.id
  )
  WHERE scorecard_id = v_scorecard_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create ONE trigger that handles ALL operations (INSERT, UPDATE, DELETE)
CREATE TRIGGER update_all_teams_match_play
  AFTER INSERT OR UPDATE OR DELETE
  ON scorecard_team_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_all_teams_match_play_total();

-- Fix all existing teams' match_play_total values
UPDATE teams
SET match_play_total = (
  SELECT COALESCE(SUM(sts.match_play_status), 0)
  FROM scorecard_team_scores sts
  WHERE sts.team_id = teams.id
);

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_all_teams_match_play_total TO authenticated;