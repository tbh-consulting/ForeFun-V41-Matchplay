/*
  # Fix Match Play Total Calculation

  1. Changes
     - Improves the calculate_team_match_play_total function to update ALL teams in a scorecard
     - Fixes the handle_team_score_deletion function to update ALL teams in a scorecard
     - Adds a function to recalculate match play totals for all teams in a scorecard
  
  2. Security
     - No changes to RLS policies
*/

-- Drop existing functions to avoid conflicts
DROP FUNCTION IF EXISTS calculate_team_match_play_total() CASCADE;
DROP FUNCTION IF EXISTS handle_team_score_deletion() CASCADE;

-- Function to update match play totals for ALL teams in a scorecard
CREATE OR REPLACE FUNCTION calculate_team_match_play_total()
RETURNS TRIGGER AS $$
DECLARE
  v_scorecard_id uuid;
  team_rec RECORD;
BEGIN
  -- Get the scorecard ID
  v_scorecard_id := NEW.scorecard_id;
  
  -- Update match_play_total for ALL teams in this scorecard
  FOR team_rec IN (
    SELECT DISTINCT team_id
    FROM scorecard_team_scores
    WHERE scorecard_id = v_scorecard_id
  ) LOOP
    UPDATE teams
    SET match_play_total = (
      SELECT COALESCE(SUM(match_play_status), 0)
      FROM scorecard_team_scores
      WHERE team_id = team_rec.team_id
        AND match_play_status IS NOT NULL
    )
    WHERE id = team_rec.team_id;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle team score deletion and update ALL teams in the scorecard
CREATE OR REPLACE FUNCTION handle_team_score_deletion()
RETURNS TRIGGER AS $$
DECLARE
  v_scorecard_id uuid;
  team_rec RECORD;
BEGIN
  -- Get the scorecard ID
  v_scorecard_id := OLD.scorecard_id;
  
  -- Update match_play_total for ALL teams in this scorecard
  FOR team_rec IN (
    SELECT DISTINCT team_id
    FROM scorecard_team_scores
    WHERE scorecard_id = v_scorecard_id
  ) LOOP
    UPDATE teams
    SET match_play_total = (
      SELECT COALESCE(SUM(match_play_status), 0)
      FROM scorecard_team_scores
      WHERE team_id = team_rec.team_id
        AND match_play_status IS NOT NULL
    )
    WHERE id = team_rec.team_id;
  END LOOP;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Function to recalculate match play totals for all teams in a scorecard
CREATE OR REPLACE FUNCTION recalculate_scorecard_match_play_totals(p_scorecard_id uuid)
RETURNS void AS $$
DECLARE
  team_rec RECORD;
BEGIN
  -- Update match_play_total for ALL teams in this scorecard
  FOR team_rec IN (
    SELECT DISTINCT team_id
    FROM scorecard_team_scores
    WHERE scorecard_id = p_scorecard_id
  ) LOOP
    UPDATE teams
    SET match_play_total = (
      SELECT COALESCE(SUM(match_play_status), 0)
      FROM scorecard_team_scores
      WHERE team_id = team_rec.team_id
        AND match_play_status IS NOT NULL
    )
    WHERE id = team_rec.team_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for match play total calculation
CREATE TRIGGER update_team_match_play_total
  AFTER INSERT OR UPDATE OF match_play_status ON scorecard_team_scores
  FOR EACH ROW
  EXECUTE FUNCTION calculate_team_match_play_total();

CREATE TRIGGER update_team_match_play_on_delete
  AFTER DELETE ON scorecard_team_scores
  FOR EACH ROW
  EXECUTE FUNCTION handle_team_score_deletion();

-- Recalculate match play totals for all existing scorecards
DO $$
DECLARE
  scorecard_rec RECORD;
BEGIN
  FOR scorecard_rec IN (
    SELECT DISTINCT scorecard_id
    FROM scorecard_team_scores
  ) LOOP
    PERFORM recalculate_scorecard_match_play_totals(scorecard_rec.scorecard_id);
  END LOOP;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION calculate_team_match_play_total TO authenticated;
GRANT EXECUTE ON FUNCTION handle_team_score_deletion TO authenticated;
GRANT EXECUTE ON FUNCTION recalculate_scorecard_match_play_totals TO authenticated;