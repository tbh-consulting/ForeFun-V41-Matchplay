/*
  # Fix match play status calculation

  1. Changes
     - Improves the match play status calculation to correctly handle the "All Square" (AS) status
     - Ensures both teams' match play totals are properly updated
     - Fixes the ambiguous column reference issue with hole_si
  
  2. Details
     - Updates the calculate_match_play_status function to properly handle team handicaps
     - Ensures match play status is correctly calculated based on net scores
     - Properly updates both teams when a hole result changes
*/

-- Fix the match play status calculation function to correctly handle handicap strokes
CREATE OR REPLACE FUNCTION calculate_match_play_status()
RETURNS TRIGGER AS $$
DECLARE
  other_team_id uuid;
  other_team_score integer;
  other_team_handicap_strokes integer;
  this_net_score integer;
  other_net_score integer;
  current_hole_si integer;
  team1_handicap numeric;
  team2_handicap numeric;
  team1_strokes integer;
  team2_strokes integer;
BEGIN
  -- Only proceed if this is a team game (scramble)
  IF TG_OP = 'UPDATE' OR TG_OP = 'INSERT' THEN
    -- Find the other team for this hole in the same scorecard
    SELECT 
      sts.team_id, 
      sts.gross_score, 
      sts.handicap_strokes, 
      sts.hole_si
    INTO 
      other_team_id, 
      other_team_score, 
      other_team_handicap_strokes, 
      current_hole_si
    FROM scorecard_team_scores sts
    WHERE sts.scorecard_id = NEW.scorecard_id
      AND sts.hole_number = NEW.hole_number
      AND sts.team_id != NEW.team_id
    LIMIT 1;
    
    -- If we found another team and both teams have scores
    IF other_team_id IS NOT NULL AND NEW.gross_score IS NOT NULL AND other_team_score IS NOT NULL THEN
      -- Get team handicaps
      SELECT handicap INTO team1_handicap FROM teams WHERE id = NEW.team_id;
      SELECT handicap INTO team2_handicap FROM teams WHERE id = other_team_id;
      
      -- Calculate strokes for each team based on handicap and hole SI
      -- A player gets a stroke if their handicap is >= the hole's SI
      team1_strokes := CASE WHEN team1_handicap >= current_hole_si THEN 1 ELSE 0 END;
      team2_strokes := CASE WHEN team2_handicap >= current_hole_si THEN 1 ELSE 0 END;
      
      -- Calculate net scores (gross score - strokes)
      this_net_score := NEW.gross_score - team1_strokes;
      other_net_score := other_team_score - team2_strokes;
      
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

-- Improve the team match play total calculation function
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