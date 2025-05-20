-- Add columns for hole information to scorecard_scores
ALTER TABLE scorecard_scores
ADD COLUMN hole_par integer,
ADD COLUMN hole_si integer,
ADD COLUMN hole_distance_black_meters integer,
ADD COLUMN hole_distance_white_meters integer,
ADD COLUMN hole_distance_yellow_meters integer,
ADD COLUMN hole_distance_blue_meters integer,
ADD COLUMN hole_distance_red_meters integer;

-- Update initialize_player_scores function to include hole information
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
      ch.distance_red_meters
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
      strokes,
      handicap_strokes,
      hole_par,
      hole_si,
      hole_distance_black_meters,
      hole_distance_white_meters,
      hole_distance_yellow_meters,
      hole_distance_blue_meters,
      hole_distance_red_meters
    ) VALUES (
      p_scorecard_id,
      p_player_id,
      v_hole.hole_number,
      NULL,
      calculate_handicap_strokes(p_handicap, v_hole.si, v_total_holes),
      v_hole.par,
      v_hole.si,
      v_hole.distance_black_meters,
      v_hole.distance_white_meters,
      v_hole.distance_yellow_meters,
      v_hole.distance_blue_meters,
      v_hole.distance_red_meters
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;