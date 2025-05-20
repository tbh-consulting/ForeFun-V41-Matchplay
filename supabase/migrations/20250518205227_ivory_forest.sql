-- Create scorecard_team_scores table for team-based games
CREATE TABLE IF NOT EXISTS scorecard_team_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scorecard_id uuid REFERENCES scorecards(id) ON DELETE CASCADE NOT NULL,
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  hole_number integer NOT NULL CHECK (hole_number BETWEEN 1 AND 18),
  gross_score integer,
  points integer,
  handicap_strokes integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  -- Hole information (copied from course_holes)
  hole_par integer,
  hole_si integer,
  hole_distance_black_meters integer,
  hole_distance_white_meters integer,
  hole_distance_yellow_meters integer,
  hole_distance_blue_meters integer,
  hole_distance_red_meters integer,
  hole_distance_black_yards integer,
  hole_distance_white_yards integer,
  hole_distance_yellow_yards integer,
  hole_distance_blue_yards integer,
  hole_distance_red_yards integer,
  UNIQUE(scorecard_id, team_id, hole_number)
);

-- Enable RLS
ALTER TABLE scorecard_team_scores ENABLE ROW LEVEL SECURITY;

-- Add constraints
ALTER TABLE scorecard_team_scores
ADD CONSTRAINT valid_gross_score CHECK (gross_score IS NULL OR gross_score >= 0),
ADD CONSTRAINT valid_points CHECK (points IS NULL OR points >= 0);

-- Create indexes for better performance
CREATE INDEX idx_scorecard_team_scores_scorecard_id ON scorecard_team_scores(scorecard_id);
CREATE INDEX idx_scorecard_team_scores_team_id ON scorecard_team_scores(team_id);
CREATE INDEX idx_scorecard_team_scores_scorecard_team ON scorecard_team_scores(scorecard_id, team_id);

-- Create policies
CREATE POLICY "Authenticated users can access team scores"
  ON scorecard_team_scores FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to initialize team scores
CREATE OR REPLACE FUNCTION initialize_team_scores(
  p_scorecard_id uuid,
  p_team_id uuid,
  p_team_handicap numeric
) RETURNS void AS $$
DECLARE
  v_hole record;
  v_total_holes integer;
BEGIN
  -- Get total number of holes for this course
  SELECT c.holes INTO v_total_holes
  FROM scorecards s
  JOIN courses c ON c.id = s.course_id
  WHERE s.id = p_scorecard_id;

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
      calculate_team_handicap_strokes(p_team_handicap, v_hole.si, v_total_holes),
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
    ON CONFLICT (scorecard_id, team_id, hole_number) DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate points for team scores
CREATE OR REPLACE FUNCTION calculate_team_points(
  gross_score integer,
  hole_par integer,
  handicap_strokes integer
) RETURNS integer AS $$
BEGIN
  -- Return null if no gross score
  IF gross_score IS NULL THEN
    RETURN NULL;
  END IF;

  -- Calculate net score (gross - handicap strokes)
  -- Then calculate points as (par + 2 - net score)
  -- Ensure minimum of 0 points
  RETURN GREATEST(0, hole_par + 2 - (gross_score - handicap_strokes));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger function to update points when gross score changes
CREATE OR REPLACE FUNCTION update_team_score_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update points if gross_score has changed
  IF TG_OP = 'UPDATE' AND NEW.gross_score IS DISTINCT FROM OLD.gross_score
     OR TG_OP = 'INSERT' AND NEW.gross_score IS NOT NULL THEN
    
    NEW.points := calculate_team_points(
      NEW.gross_score,
      NEW.hole_par,
      NEW.handicap_strokes
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_team_points
  BEFORE INSERT OR UPDATE ON scorecard_team_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_team_score_points();

-- Add total_gross_score and total_points columns to teams
ALTER TABLE teams
ADD COLUMN IF NOT EXISTS total_gross_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_points integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS relative_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed_holes integer DEFAULT 0;

-- Create indexes for these new columns
CREATE INDEX IF NOT EXISTS idx_teams_total_gross_score ON teams(total_gross_score);
CREATE INDEX IF NOT EXISTS idx_teams_total_points ON teams(total_points);
CREATE INDEX IF NOT EXISTS idx_teams_relative_score ON teams(relative_score);
CREATE INDEX IF NOT EXISTS idx_teams_completed_holes ON teams(completed_holes);

-- Function to update team total gross score
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

-- Function to update team total points
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

-- Function to update team completed holes
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

-- Function to calculate team relative score
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

-- Create triggers
CREATE TRIGGER update_team_total_gross_score
  AFTER INSERT OR UPDATE OF gross_score OR DELETE
  ON scorecard_team_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_team_total_gross_score();

CREATE TRIGGER update_team_total_points
  AFTER INSERT OR UPDATE OF points OR DELETE
  ON scorecard_team_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_team_total_points();

CREATE TRIGGER update_team_completed_holes
  AFTER INSERT OR UPDATE OF gross_score OR DELETE
  ON scorecard_team_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_team_completed_holes();

CREATE TRIGGER update_team_relative_score
  AFTER INSERT OR UPDATE OF gross_score OR DELETE
  ON scorecard_team_scores
  FOR EACH ROW
  EXECUTE FUNCTION calculate_team_relative_score();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION initialize_team_scores TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_team_points TO authenticated;
GRANT EXECUTE ON FUNCTION update_team_score_points TO authenticated;