/*
  # Add Matchplay Scoring for Scramble Games

  1. Changes
    - Add match_play_status column to scorecard_team_scores table
    - Update team_scores view to include match_play_status
    - Create function to calculate match play status after score updates
    - Add trigger to update match play status when scores change

  2. Match Play Scoring Logic
    - 1: Team won the hole
    - 0: Hole was halved (tied)
    -1: Team lost the hole
    - null: Not yet determined
*/

-- Add match_play_status column to scorecard_team_scores table
ALTER TABLE IF EXISTS public.scorecard_team_scores
ADD COLUMN IF NOT EXISTS match_play_status integer DEFAULT 0;

-- Create index for match_play_status
CREATE INDEX IF NOT EXISTS idx_scorecard_team_scores_match_play_status
ON public.scorecard_team_scores(match_play_status);

-- Create function to calculate match play status
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
      this_net_score = NEW.gross_score - NEW.handicap_strokes;
      other_net_score = other_team_score - other_team_handicap_strokes;
      
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

-- Create trigger to update match play status
DROP TRIGGER IF EXISTS update_match_play_status ON public.scorecard_team_scores;
CREATE TRIGGER update_match_play_status
BEFORE INSERT OR UPDATE OF gross_score, handicap_strokes
ON public.scorecard_team_scores
FOR EACH ROW
EXECUTE FUNCTION calculate_match_play_status();

-- Create function to calculate team match play total
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

-- Create trigger to update team match play total
DROP TRIGGER IF EXISTS update_team_match_play_total ON public.scorecard_team_scores;
CREATE TRIGGER update_team_match_play_total
AFTER INSERT OR UPDATE OF match_play_status
ON public.scorecard_team_scores
FOR EACH ROW
EXECUTE FUNCTION calculate_team_match_play_total();

-- Add match_play_total column to teams table
ALTER TABLE IF EXISTS public.teams
ADD COLUMN IF NOT EXISTS match_play_total integer DEFAULT 0;

-- Create index for match_play_total
CREATE INDEX IF NOT EXISTS idx_teams_match_play_total
ON public.teams(match_play_total);