-- Add gross_score and points columns to scorecard_scores
ALTER TABLE scorecard_scores
ADD COLUMN gross_score integer,
ADD COLUMN points integer;

-- Add check constraints
ALTER TABLE scorecard_scores
ADD CONSTRAINT valid_gross_score CHECK (gross_score IS NULL OR gross_score >= 0),
ADD CONSTRAINT valid_points CHECK (points IS NULL OR points >= 0);

-- Update initialize_player_scores function to include new columns
CREATE OR REPLACE FUNCTION initialize_player_scores(
  p_scorecard_id uuid,
  p_player_id uuid,
  p_handicap numeric
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
    INSERT INTO scorecard_scores (
      scorecard_id,
      player_id,
      hole_number,
      handicap_strokes,
      gross_score,
      points,
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
      p_player_id,
      v_hole.hole_number,
      calculate_handicap_strokes(p_handicap, v_hole.si, v_total_holes),
      NULL, -- Initialize gross_score as NULL
      NULL, -- Initialize points as NULL
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
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;