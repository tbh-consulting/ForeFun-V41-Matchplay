/*
  # Add Match Play Score to Team Scorecards

  1. New Columns
    - `match_play_status` column to scorecard_team_scores table
    - Stores the cumulative match play score for each team at each hole

  2. New Functions
    - calculate_match_play_status: Calculates the match play status for each hole
    - update_match_play_status: Trigger function to update match play status when scores change

  3. Trigger
    - Add trigger to update match play status when scores change
*/

-- Add match_play_status column to scorecard_team_scores table
ALTER TABLE scorecard_team_scores
ADD COLUMN IF NOT EXISTS match_play_status integer DEFAULT 0;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_scorecard_team_scores_match_play_status 
ON scorecard_team_scores(match_play_status);

-- Function to calculate match play status for a hole
CREATE OR REPLACE FUNCTION calculate_match_play_status(
  p_scorecard_id uuid,
  p_hole_number integer
)
RETURNS void AS $$
DECLARE
  v_team_scores record;
  v_team1_id uuid;
  v_team2_id uuid;
  v_team1_net_score integer;
  v_team2_net_score integer;
  v_hole_result integer;
  v_team1_status integer := 0;
  v_team2_status integer := 0;
  v_prev_hole integer;
  v_prev_team1_status integer := 0;
  v_prev_team2_status integer := 0;
BEGIN
  -- Get the two teams for this scorecard
  SELECT 
    array_agg(team_id) INTO v_team_scores
  FROM (
    SELECT DISTINCT team_id
    FROM scorecard_team_scores
    WHERE scorecard_id = p_scorecard_id
    LIMIT 2
  ) teams;
  
  -- If we don't have exactly 2 teams, exit
  IF array_length(v_team_scores, 1) != 2 THEN
    RETURN;
  END IF;
  
  v_team1_id := v_team_scores[1];
  v_team2_id := v_team_scores[2];
  
  -- If this is not the first hole, get previous hole's status
  IF p_hole_number > 1 THEN
    v_prev_hole := p_hole_number - 1;
    
    -- Get previous hole's match play status
    SELECT match_play_status INTO v_prev_team1_status
    FROM scorecard_team_scores
    WHERE scorecard_id = p_scorecard_id
    AND team_id = v_team1_id
    AND hole_number = v_prev_hole;
    
    SELECT match_play_status INTO v_prev_team2_status
    FROM scorecard_team_scores
    WHERE scorecard_id = p_scorecard_id
    AND team_id = v_team2_id
    AND hole_number = v_prev_hole;
  END IF;
  
  -- Get net scores for current hole
  SELECT 
    CASE WHEN gross_score IS NULL THEN NULL 
    ELSE gross_score - handicap_strokes END
  INTO v_team1_net_score
  FROM scorecard_team_scores
  WHERE scorecard_id = p_scorecard_id
  AND team_id = v_team1_id
  AND hole_number = p_hole_number;
  
  SELECT 
    CASE WHEN gross_score IS NULL THEN NULL 
    ELSE gross_score - handicap_strokes END
  INTO v_team2_net_score
  FROM scorecard_team_scores
  WHERE scorecard_id = p_scorecard_id
  AND team_id = v_team2_id
  AND hole_number = p_hole_number;
  
  -- If either team hasn't entered a score, use previous hole's status
  IF v_team1_net_score IS NULL OR v_team2_net_score IS NULL THEN
    v_team1_status := v_prev_team1_status;
    v_team2_status := v_prev_team2_status;
  ELSE
    -- Determine hole result
    IF v_team1_net_score < v_team2_net_score THEN
      -- Team 1 wins hole
      v_hole_result := 1;
    ELSIF v_team1_net_score > v_team2_net_score THEN
      -- Team 2 wins hole
      v_hole_result := -1;
    ELSE
      -- Hole is halved
      v_hole_result := 0;
    END IF;
    
    -- Update match status based on previous status and current hole result
    v_team1_status := v_prev_team1_status + v_hole_result;
    v_team2_status := v_prev_team2_status - v_hole_result;
  END IF;
  
  -- Update match play status for both teams
  UPDATE scorecard_team_scores
  SET match_play_status = v_team1_status
  WHERE scorecard_id = p_scorecard_id
  AND team_id = v_team1_id
  AND hole_number = p_hole_number;
  
  UPDATE scorecard_team_scores
  SET match_play_status = v_team2_status
  WHERE scorecard_id = p_scorecard_id
  AND team_id = v_team2_id
  AND hole_number = p_hole_number;
END;
$$ LANGUAGE plpgsql;

-- Function to update match play status for all holes in a scorecard
CREATE OR REPLACE FUNCTION update_all_match_play_statuses(
  p_scorecard_id uuid
)
RETURNS void AS $$
DECLARE
  v_hole record;
  v_course_id uuid;
BEGIN
  -- Get course ID
  SELECT course_id INTO v_course_id
  FROM scorecards
  WHERE id = p_scorecard_id;
  
  -- For each hole in the course
  FOR v_hole IN (
    SELECT hole_number
    FROM course_holes
    WHERE course_id = v_course_id
    ORDER BY hole_number
  ) LOOP
    -- Calculate match play status for this hole
    PERFORM calculate_match_play_status(p_scorecard_id, v_hole.hole_number);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to update match play status when scores change
CREATE OR REPLACE FUNCTION update_match_play_status()
RETURNS TRIGGER AS $$
DECLARE
  v_hole_number integer;
  v_scorecard_id uuid;
  v_max_holes integer;
BEGIN
  -- Get the hole number and scorecard ID
  IF TG_OP = 'DELETE' THEN
    v_hole_number := OLD.hole_number;
    v_scorecard_id := OLD.scorecard_id;
  ELSE
    v_hole_number := NEW.hole_number;
    v_scorecard_id := NEW.scorecard_id;
  END IF;
  
  -- Get the maximum number of holes for this course
  SELECT c.holes INTO v_max_holes
  FROM scorecards s
  JOIN courses c ON c.id = s.course_id
  WHERE s.id = v_scorecard_id;
  
  -- Update match play status for this hole and all subsequent holes
  FOR i IN v_hole_number..v_max_holes LOOP
    PERFORM calculate_match_play_status(v_scorecard_id, i);
  END LOOP;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update match play status when scores change
CREATE TRIGGER update_match_play_status_trigger
  AFTER INSERT OR UPDATE OF gross_score OR DELETE
  ON scorecard_team_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_match_play_status();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION calculate_match_play_status TO authenticated;
GRANT EXECUTE ON FUNCTION update_all_match_play_statuses TO authenticated;
GRANT EXECUTE ON FUNCTION update_match_play_status TO authenticated;