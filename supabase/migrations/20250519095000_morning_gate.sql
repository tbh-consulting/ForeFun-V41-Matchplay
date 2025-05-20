-- Improve the match play total calculation function to update all teams with the same scorecard_id
CREATE OR REPLACE FUNCTION calculate_team_match_play_total()
RETURNS TRIGGER AS $$
DECLARE
  v_scorecard_id uuid;
  v_team_id uuid;
BEGIN
  -- Get the scorecard ID and team ID
  v_scorecard_id := NEW.scorecard_id;
  v_team_id := NEW.team_id;
  
  -- First, update the current team's match_play_total
  UPDATE teams
  SET match_play_total = (
    SELECT COALESCE(SUM(match_play_status), 0)
    FROM scorecard_team_scores
    WHERE team_id = v_team_id
      AND scorecard_id = v_scorecard_id
  )
  WHERE id = v_team_id;
  
  -- Then update ALL OTHER teams with the same scorecard_id
  UPDATE teams
  SET match_play_total = (
    SELECT COALESCE(SUM(match_play_status), 0)
    FROM scorecard_team_scores
    WHERE team_id = teams.id
      AND scorecard_id = v_scorecard_id
  )
  WHERE 
    scorecard_id = v_scorecard_id 
    AND id != v_team_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Improve the team score deletion handler to update all teams with the same scorecard_id
CREATE OR REPLACE FUNCTION handle_team_score_deletion()
RETURNS TRIGGER AS $$
DECLARE
  v_scorecard_id uuid;
  v_team_id uuid;
BEGIN
  -- Get the scorecard ID and team ID
  v_scorecard_id := OLD.scorecard_id;
  v_team_id := OLD.team_id;
  
  -- First, update the current team's match_play_total
  UPDATE teams
  SET match_play_total = (
    SELECT COALESCE(SUM(match_play_status), 0)
    FROM scorecard_team_scores
    WHERE team_id = v_team_id
      AND scorecard_id = v_scorecard_id
  )
  WHERE id = v_team_id;
  
  -- Then update ALL OTHER teams with the same scorecard_id
  UPDATE teams
  SET match_play_total = (
    SELECT COALESCE(SUM(match_play_status), 0)
    FROM scorecard_team_scores
    WHERE team_id = teams.id
      AND scorecard_id = v_scorecard_id
  )
  WHERE 
    scorecard_id = v_scorecard_id 
    AND id != v_team_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Add a trigger to update match play totals when match_play_status changes
CREATE OR REPLACE FUNCTION update_all_teams_match_play_total()
RETURNS TRIGGER AS $$
DECLARE
  v_scorecard_id uuid;
BEGIN
  -- Get the scorecard ID
  v_scorecard_id := NEW.scorecard_id;
  
  -- Update ALL teams with the same scorecard_id
  UPDATE teams
  SET match_play_total = (
    SELECT COALESCE(SUM(match_play_status), 0)
    FROM scorecard_team_scores
    WHERE team_id = teams.id
      AND scorecard_id = v_scorecard_id
  )
  WHERE scorecard_id = v_scorecard_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a new trigger specifically for updating all teams when gross_score changes
DROP TRIGGER IF EXISTS update_all_teams_match_play ON scorecard_team_scores;
CREATE TRIGGER update_all_teams_match_play
  AFTER UPDATE OF gross_score, handicap_strokes
  ON scorecard_team_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_all_teams_match_play_total();

-- Function to recalculate match play totals for all teams in a scorecard
CREATE OR REPLACE FUNCTION recalculate_all_teams_match_play_totals(p_scorecard_id uuid)
RETURNS void AS $$
BEGIN
  -- Update match_play_total for ALL teams in this scorecard
  UPDATE teams
  SET match_play_total = (
    SELECT COALESCE(SUM(match_play_status), 0)
    FROM scorecard_team_scores
    WHERE team_id = teams.id
      AND scorecard_id = p_scorecard_id
  )
  WHERE scorecard_id = p_scorecard_id;
END;
$$ LANGUAGE plpgsql;

-- Recalculate match play totals for all existing scorecards
DO $$
DECLARE
  scorecard_rec RECORD;
BEGIN
  FOR scorecard_rec IN (
    SELECT DISTINCT scorecard_id
    FROM scorecard_team_scores
  ) LOOP
    PERFORM recalculate_all_teams_match_play_totals(scorecard_rec.scorecard_id);
  END LOOP;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION update_all_teams_match_play_total TO authenticated;
GRANT EXECUTE ON FUNCTION recalculate_all_teams_match_play_totals TO authenticated;