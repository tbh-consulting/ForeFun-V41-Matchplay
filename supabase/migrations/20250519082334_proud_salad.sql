/*
  # Fix Match Play Scoring

  1. Changes
     - Fix the match play status calculation to properly handle strokes
     - Ensure match play status is displayed correctly in the UI
     - Add match play status to the scorecard summary
*/

-- Improve the match play status calculation function
CREATE OR REPLACE FUNCTION calculate_match_play_status()
RETURNS TRIGGER AS $$
DECLARE
  other_team_id uuid;
  other_team_score integer;
  other_team_handicap_strokes integer;
  this_net_score integer;
  other_net_score integer;
BEGIN
  -- Only proceed if this is a team game (scramble)
  IF TG_OP = 'UPDATE' OR TG_OP = 'INSERT' THEN
    -- Find the other team for this hole in the same scorecard
    SELECT team_id, gross_score, handicap_strokes
    INTO other_team_id, other_team_score, other_team_handicap_strokes
    FROM scorecard_team_scores
    WHERE scorecard_id = NEW.scorecard_id
      AND hole_number = NEW.hole_number
      AND team_id != NEW.team_id
    LIMIT 1;
    
    -- If we found another team and both teams have scores
    IF other_team_id IS NOT NULL AND NEW.gross_score IS NOT NULL AND other_team_score IS NOT NULL THEN
      -- Calculate net scores (gross score - handicap strokes)
      this_net_score = NEW.gross_score - COALESCE(NEW.handicap_strokes, 0);
      other_net_score = other_team_score - COALESCE(other_team_handicap_strokes, 0);
      
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