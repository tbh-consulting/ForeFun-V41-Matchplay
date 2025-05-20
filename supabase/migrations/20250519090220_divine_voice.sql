/*
  # Fix Match Play Calculation

  1. Changes
     - Simplifies the match play status calculation to use net scores (gross score - handicap strokes)
     - Ensures proper updating of both teams' match play status for each hole
     - Fixes the team match play total calculation

  2. Security
     - No changes to RLS policies
*/

-- Fix the match play status calculation function to correctly handle handicap strokes
CREATE OR REPLACE FUNCTION calculate_match_play_status()
RETURNS TRIGGER AS $$
DECLARE
  other_team_id uuid;
  other_team_score integer;
  other_team_strokes integer;
  this_net_score integer;
  other_net_score integer;
BEGIN
  -- Only proceed if this is a team game (scramble)
  IF TG_OP = 'UPDATE' OR TG_OP = 'INSERT' THEN
    -- Find the other team for this hole in the same scorecard
    SELECT 
      sts.team_id, 
      sts.gross_score, 
      sts.handicap_strokes
    INTO 
      other_team_id, 
      other_team_score, 
      other_team_strokes
    FROM scorecard_team_scores sts
    WHERE sts.scorecard_id = NEW.scorecard_id
      AND sts.hole_number = NEW.hole_number
      AND sts.team_id != NEW.team_id
    LIMIT 1;
    
    -- If we found another team and both teams have scores
    IF other_team_id IS NOT NULL AND NEW.gross_score IS NOT NULL AND other_team_score IS NOT NULL THEN
      -- Calculate net scores (gross score - handicap strokes)
      this_net_score := NEW.gross_score - COALESCE(NEW.handicap_strokes, 0);
      other_net_score := other_team_score - COALESCE(other_team_strokes, 0);
      
      -- Determine match play status
      IF this_net_score < other_net_score THEN
        -- This team won the hole
        NEW.match_play_status := 1;
        
        -- Update the other team's status
        UPDATE scorecard_team_scores
        SET match_play_status = -1
        WHERE scorecard_id = NEW.scorecard_id
          AND hole_number = NEW.hole_number
          AND team_id = other_team_id;
      ELSIF this_net_score > other_net_score THEN
        -- This team lost the hole
        NEW.match_play_status := -1;
        
        -- Update the other team's status
        UPDATE scorecard_team_scores
        SET match_play_status = 1
        WHERE scorecard_id = NEW.scorecard_id
          AND hole_number = NEW.hole_number
          AND team_id = other_team_id;
      ELSE
        -- The hole was halved (tied)
        NEW.match_play_status := 0;
        
        -- Update the other team's status
        UPDATE scorecard_team_scores
        SET match_play_status = 0
        WHERE scorecard_id = NEW.scorecard_id
          AND hole_number = NEW.hole_number
          AND team_id = other_team_id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
  WHERE scorecard_id = NEW.scorecard_id
    AND team_id = NEW.team_id
    AND match_play_status IS NOT NULL;
  
  -- Update the team's match_play_total
  UPDATE teams
  SET match_play_total = total_match_play
  WHERE id = NEW.team_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;