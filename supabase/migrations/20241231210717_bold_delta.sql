-- Allow null values for strokes in scorecard_scores
ALTER TABLE scorecard_scores
ALTER COLUMN strokes DROP NOT NULL;

-- Update check constraint to allow null values
ALTER TABLE scorecard_scores
DROP CONSTRAINT IF EXISTS scorecard_scores_strokes_check,
ADD CONSTRAINT scorecard_scores_strokes_check
  CHECK (strokes IS NULL OR strokes >= 0);

-- Update trigger function to initialize scores with null strokes
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
    SELECT ch.hole_number, ch.handicap as si
    FROM scorecards s
    JOIN courses c ON c.id = s.course_id
    JOIN course_holes ch ON ch.course_id = c.id
    WHERE s.id = p_scorecard_id
    ORDER BY ch.hole_number
  ) LOOP
    -- Insert score record with calculated handicap strokes
    INSERT INTO scorecard_scores (
      scorecard_id,
      player_id,
      hole_number,
      strokes,
      handicap_strokes
    ) VALUES (
      p_scorecard_id,
      p_player_id,
      v_hole.hole_number,
      NULL, -- Initialize strokes as NULL instead of 0
      calculate_handicap_strokes(p_handicap, v_hole.si, v_total_holes)
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;