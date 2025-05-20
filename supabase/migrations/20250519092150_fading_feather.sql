/*
  # Fix Match Play Total Calculation

  1. Changes
     - Improves the calculate_team_match_play_total function to correctly update the match_play_total in the teams table
     - Adds a trigger to recalculate match play totals when scores are deleted
     - Adds a function to recalculate all match play totals for a scorecard

  2. Security
     - No changes to security policies
*/

-- Fix the team match play total calculation function
CREATE OR REPLACE FUNCTION calculate_team_match_play_total()
RETURNS TRIGGER AS $$
DECLARE
  total_match_play integer;
BEGIN
  -- Calculate the sum of match_play_status for this team
  SELECT COALESCE(SUM(match_play_status), 0)
  INTO total_match_play
  FROM scorecard_team_scores
  WHERE team_id = NEW.team_id
    AND match_play_status IS NOT NULL;
  
  -- Update the team's match_play_total
  UPDATE teams
  SET match_play_total = total_match_play
  WHERE id = NEW.team_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a function to handle deletion of scores
CREATE OR REPLACE FUNCTION handle_team_score_deletion()
RETURNS TRIGGER AS $$
DECLARE
  total_match_play integer;
BEGIN
  -- Calculate the sum of match_play_status for this team
  SELECT COALESCE(SUM(match_play_status), 0)
  INTO total_match_play
  FROM scorecard_team_scores
  WHERE team_id = OLD.team_id
    AND match_play_status IS NOT NULL;
  
  -- Update the team's match_play_total
  UPDATE teams
  SET match_play_total = total_match_play
  WHERE id = OLD.team_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for handling score deletion
DROP TRIGGER IF EXISTS update_team_match_play_on_delete ON public.scorecard_team_scores;
CREATE TRIGGER update_team_match_play_on_delete
AFTER DELETE
ON public.scorecard_team_scores
FOR EACH ROW
EXECUTE FUNCTION handle_team_score_deletion();

-- Create a function to recalculate all match play totals for a scorecard
CREATE OR REPLACE FUNCTION recalculate_all_match_play_totals(p_scorecard_id uuid)
RETURNS void AS $$
DECLARE
  team_rec RECORD;
BEGIN
  -- Get all teams in this scorecard
  FOR team_rec IN (
    SELECT DISTINCT team_id
    FROM scorecard_team_scores
    WHERE scorecard_id = p_scorecard_id
  ) LOOP
    -- Calculate the sum of match_play_status for this team
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

-- Recalculate all match play totals for existing scorecards
DO $$
DECLARE
  scorecard_rec RECORD;
BEGIN
  FOR scorecard_rec IN (
    SELECT DISTINCT scorecard_id
    FROM scorecard_team_scores
  ) LOOP
    PERFORM recalculate_all_match_play_totals(scorecard_rec.scorecard_id);
  END LOOP;
END;
$$;