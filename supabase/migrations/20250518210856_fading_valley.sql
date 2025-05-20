-- Add columns to teams table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'teams' AND column_name = 'total_gross_score'
  ) THEN
    ALTER TABLE teams ADD COLUMN total_gross_score integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'teams' AND column_name = 'total_points'
  ) THEN
    ALTER TABLE teams ADD COLUMN total_points integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'teams' AND column_name = 'relative_score'
  ) THEN
    ALTER TABLE teams ADD COLUMN relative_score integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'teams' AND column_name = 'completed_holes'
  ) THEN
    ALTER TABLE teams ADD COLUMN completed_holes integer DEFAULT 0;
  END IF;
END$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_teams_total_gross_score ON teams(total_gross_score);
CREATE INDEX IF NOT EXISTS idx_teams_total_points ON teams(total_points);
CREATE INDEX IF NOT EXISTS idx_teams_relative_score ON teams(relative_score);
CREATE INDEX IF NOT EXISTS idx_teams_completed_holes ON teams(completed_holes);

-- Function to calculate team handicap strokes
CREATE OR REPLACE FUNCTION calculate_team_handicap_strokes(
  team_handicap numeric,
  hole_si integer,
  total_holes integer DEFAULT 18
) RETURNS integer AS $$
DECLARE
  strokes integer := 0;
BEGIN
  -- Return 0 if no handicap or SI
  IF team_handicap IS NULL OR hole_si IS NULL THEN
    RETURN 0;
  END IF;

  -- Calculate base strokes (1 stroke if handicap >= hole SI)
  IF team_handicap >= hole_si THEN
    strokes := strokes + 1;
  END IF;

  -- Add extra strokes if handicap is high enough
  IF team_handicap > 18 THEN
    -- Calculate how many holes get an extra stroke
    -- Example: handicap 24 means SI 1-6 get an extra stroke
    IF hole_si <= (team_handicap - 18) THEN
      strokes := strokes + 1;
    END IF;
  END IF;

  RETURN strokes;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to initialize team scores for all holes
CREATE OR REPLACE FUNCTION initialize_team_scores(
  p_scorecard_id uuid,
  p_team_id uuid,
  p_team_handicap numeric
) RETURNS void AS $$
DECLARE
  v_hole record;
  v_total_holes integer;
  v_handicap_strokes integer;
  v_team_handicap numeric;
BEGIN
  -- Get total number of holes for this course
  SELECT c.holes INTO v_total_holes
  FROM scorecards s
  JOIN courses c ON c.id = s.course_id
  WHERE s.id = p_scorecard_id;

  -- Get team handicap from teams table if not provided
  IF p_team_handicap IS NULL THEN
    SELECT handicap INTO v_team_handicap FROM teams WHERE id = p_team_id;
  ELSE
    v_team_handicap := p_team_handicap;
  END IF;

  -- Ensure we have a valid handicap value
  IF v_team_handicap IS NULL THEN
    v_team_handicap := 0;
  END IF;

  -- For each hole in the course
  FOR v_hole IN (
    SELECT 
      ch.hole_number,
      ch.handicap as si,
      ch.par,
      ch.distance_black_meters,
      ch.distance_white_meters,
      ch.distance_yellow_meters,
      ch.distance_blue_meters,
      ch.distance_red_meters,
      ch.distance_black_yards,
      ch.distance_white_yards,
      ch.distance_yellow_yards,
      ch.distance_blue_yards,
      ch.distance_red_yards
    FROM scorecards s
    JOIN courses c ON c.id = s.course_id
    JOIN course_holes ch ON ch.course_id = c.id
    WHERE s.id = p_scorecard_id
    ORDER BY ch.hole_number
  ) LOOP
    -- Calculate handicap strokes for this hole
    v_handicap_strokes := calculate_team_handicap_strokes(v_team_handicap, v_hole.si, v_total_holes);
    
    -- Insert score record with all hole information
    INSERT INTO scorecard_team_scores (
      scorecard_id,
      team_id,
      hole_number,
      gross_score,
      points,
      handicap_strokes,
      hole_par,
      hole_si,
      -- Distances in meters
      hole_distance_black_meters,
      hole_distance_white_meters,
      hole_distance_yellow_meters,
      hole_distance_blue_meters,
      hole_distance_red_meters,
      -- Distances in yards
      hole_distance_black_yards,
      hole_distance_white_yards,
      hole_distance_yellow_yards,
      hole_distance_blue_yards,
      hole_distance_red_yards
    ) VALUES (
      p_scorecard_id,
      p_team_id,
      v_hole.hole_number,
      NULL,
      NULL,
      v_handicap_strokes,
      v_hole.par,
      v_hole.si,
      -- Meters
      v_hole.distance_black_meters,
      v_hole.distance_white_meters,
      v_hole.distance_yellow_meters,
      v_hole.distance_blue_meters,
      v_hole.distance_red_meters,
      -- Yards
      v_hole.distance_black_yards,
      v_hole.distance_white_yards,
      v_hole.distance_yellow_yards,
      v_hole.distance_blue_yards,
      v_hole.distance_red_yards
    )
    ON CONFLICT (scorecard_id, team_id, hole_number) DO UPDATE
    SET 
      handicap_strokes = v_handicap_strokes,
      hole_par = v_hole.par,
      hole_si = v_hole.si;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate points for team scores
CREATE OR REPLACE FUNCTION update_team_score_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update points if gross_score has changed
  IF TG_OP = 'UPDATE' AND NEW.gross_score IS DISTINCT FROM OLD.gross_score
     OR TG_OP = 'INSERT' AND NEW.gross_score IS NOT NULL THEN
    
    -- Calculate points using the same formula as individual scores
    -- (par + 2 - net score), with minimum of 0
    NEW.points := GREATEST(0, NEW.hole_par + 2 - (NEW.gross_score - NEW.handicap_strokes));
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update team's total gross score
CREATE OR REPLACE FUNCTION update_team_total_gross_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total_gross_score for the affected team
  UPDATE teams
  SET total_gross_score = (
    SELECT COALESCE(SUM(gross_score), 0)
    FROM scorecard_team_scores
    WHERE team_id = COALESCE(NEW.team_id, OLD.team_id)
    AND gross_score IS NOT NULL
  )
  WHERE id = COALESCE(NEW.team_id, OLD.team_id);

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update team's total points
CREATE OR REPLACE FUNCTION update_team_total_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total_points for the affected team
  UPDATE teams
  SET total_points = (
    SELECT COALESCE(SUM(points), 0)
    FROM scorecard_team_scores
    WHERE team_id = COALESCE(NEW.team_id, OLD.team_id)
    AND points IS NOT NULL
  )
  WHERE id = COALESCE(NEW.team_id, OLD.team_id);

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update team's completed holes count
CREATE OR REPLACE FUNCTION update_team_completed_holes()
RETURNS TRIGGER AS $$
BEGIN
  -- Update completed_holes for the affected team
  UPDATE teams
  SET completed_holes = (
    SELECT COUNT(*)
    FROM scorecard_team_scores
    WHERE team_id = COALESCE(NEW.team_id, OLD.team_id)
    AND gross_score IS NOT NULL
  )
  WHERE id = COALESCE(NEW.team_id, OLD.team_id);

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate team's score relative to par
CREATE OR REPLACE FUNCTION calculate_team_relative_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Update relative_score for the affected team
  UPDATE teams
  SET relative_score = (
    SELECT COALESCE(SUM(gross_score - hole_par), 0)
    FROM scorecard_team_scores
    WHERE team_id = COALESCE(NEW.team_id, OLD.team_id)
    AND gross_score IS NOT NULL
  )
  WHERE id = COALESCE(NEW.team_id, OLD.team_id);

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_team_points ON scorecard_team_scores;
DROP TRIGGER IF EXISTS update_team_total_gross_score ON scorecard_team_scores;
DROP TRIGGER IF EXISTS update_team_total_points ON scorecard_team_scores;
DROP TRIGGER IF EXISTS update_team_completed_holes ON scorecard_team_scores;
DROP TRIGGER IF EXISTS update_team_relative_score ON scorecard_team_scores;

-- Create triggers with IF NOT EXISTS
CREATE TRIGGER update_team_points
  BEFORE INSERT OR UPDATE ON scorecard_team_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_team_score_points();

CREATE TRIGGER update_team_total_gross_score
  AFTER INSERT OR DELETE OR UPDATE OF gross_score ON scorecard_team_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_team_total_gross_score();

CREATE TRIGGER update_team_total_points
  AFTER INSERT OR DELETE OR UPDATE OF points ON scorecard_team_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_team_total_points();

CREATE TRIGGER update_team_completed_holes
  AFTER INSERT OR DELETE OR UPDATE OF gross_score ON scorecard_team_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_team_completed_holes();

CREATE TRIGGER update_team_relative_score
  AFTER INSERT OR DELETE OR UPDATE OF gross_score ON scorecard_team_scores
  FOR EACH ROW
  EXECUTE FUNCTION calculate_team_relative_score();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION calculate_team_handicap_strokes TO authenticated;
GRANT EXECUTE ON FUNCTION initialize_team_scores TO authenticated;
GRANT EXECUTE ON FUNCTION update_team_score_points TO authenticated;
GRANT EXECUTE ON FUNCTION update_team_total_gross_score TO authenticated;
GRANT EXECUTE ON FUNCTION update_team_total_points TO authenticated;
GRANT EXECUTE ON FUNCTION update_team_completed_holes TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_team_relative_score TO authenticated;