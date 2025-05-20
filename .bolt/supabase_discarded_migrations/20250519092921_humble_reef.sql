/*
  # Fix Match Play Total Calculation

  1. Changes
     - Fixes the calculation of match_play_total in teams table
     - Ensures match_play_total is the sum of all match_play_status values for a team
     - Adds proper handling for score deletion
  
  2. New Functions
     - Improved calculate_team_match_play_total() function
     - Added handle_team_score_deletion() function
     - Added recalculate_all_match_play_totals() utility function
*/

-- Fix the team match play total calculation function to sum all match play statuses for a team
CREATE OR REPLACE FUNCTION calculate_team_match_play_total()
RETURNS TRIGGER AS $$
DECLARE
  total_match_play integer;
BEGIN
  -- Calculate the sum of match_play_status for this team across all scorecards
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
  other_team_id uuid;
BEGIN
  -- Find the other team for this hole in the same scorecard
  SELECT team_id
  INTO other_team_id
  FROM scorecard_team_scores
  WHERE scorecard_id = OLD.scorecard_id
    AND hole_number = OLD.hole_number
    AND team_id != OLD.team_id
  LIMIT 1;
  
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
  
  -- If we found another team, update its match_play_total too
  IF other_team_id IS NOT NULL THEN
    SELECT COALESCE(SUM(match_play_status), 0)
    INTO total_match_play
    FROM scorecard_team_scores
    WHERE team_id = other_team_id
      AND match_play_status IS NOT NULL;
    
    UPDATE teams
    SET match_play_total = total_match_play
    WHERE id = other_team_id;
  END IF;
  
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

-- Create a function to recalculate all match play totals
CREATE OR REPLACE FUNCTION recalculate_all_match_play_totals()
RETURNS void AS $$
DECLARE
  team_rec RECORD;
BEGIN
  -- Get all teams
  FOR team_rec IN (
    SELECT id
    FROM teams
  ) LOOP
    -- Calculate the sum of match_play_status for this team
    UPDATE teams
    SET match_play_total = (
      SELECT COALESCE(SUM(match_play_status), 0)
      FROM scorecard_team_scores
      WHERE team_id = team_rec.id
        AND match_play_status IS NOT NULL
    )
    WHERE id = team_rec.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Recalculate all match play totals for existing teams
SELECT recalculate_all_match_play_totals();