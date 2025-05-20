-- Drop existing functions and triggers to start fresh
DROP TRIGGER IF EXISTS update_team_match_play_total ON scorecard_team_scores;
DROP TRIGGER IF EXISTS update_team_match_play_on_delete ON scorecard_team_scores;
DROP TRIGGER IF EXISTS update_all_teams_match_play ON scorecard_team_scores;
DROP FUNCTION IF EXISTS calculate_team_match_play_total();
DROP FUNCTION IF EXISTS handle_team_score_deletion();
DROP FUNCTION IF EXISTS update_all_teams_match_play_total();

-- Create a SIMPLE function that updates ALL teams in a scorecard
CREATE OR REPLACE FUNCTION update_all_teams_match_play_total()
RETURNS TRIGGER AS $$
DECLARE
  v_scorecard_id uuid;
BEGIN
  -- Get the scorecard ID
  IF TG_OP = 'DELETE' THEN
    v_scorecard_id := OLD.scorecard_id;
  ELSE
    v_scorecard_id := NEW.scorecard_id;
  END IF;
  
  -- Update ALL teams with this scorecard_id - no exceptions
  UPDATE teams
  SET match_play_total = (
    SELECT COALESCE(SUM(match_play_status), 0)
    FROM scorecard_team_scores
    WHERE team_id = teams.id
  )
  WHERE scorecard_id = v_scorecard_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create ONE trigger that handles ALL cases
CREATE TRIGGER update_all_teams_match_play
  AFTER INSERT OR UPDATE OR DELETE
  ON scorecard_team_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_all_teams_match_play_total();

-- Recalculate match play totals for all existing teams
UPDATE teams
SET match_play_total = (
  SELECT COALESCE(SUM(match_play_status), 0)
  FROM scorecard_team_scores
  WHERE team_id = teams.id
);

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_all_teams_match_play_total TO authenticated;