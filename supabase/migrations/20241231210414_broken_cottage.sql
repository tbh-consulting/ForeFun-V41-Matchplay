-- Function to calculate handicap strokes for a hole
CREATE OR REPLACE FUNCTION calculate_handicap_strokes(
  player_handicap numeric,
  hole_si integer,
  total_holes integer
) RETURNS integer AS $$
DECLARE
  strokes integer := 0;
  max_strokes integer;
BEGIN
  -- Calculate max strokes per hole based on total holes
  max_strokes := CASE
    WHEN total_holes = 9 THEN CEIL(player_handicap / 9.0)::integer * 2
    ELSE CEIL(player_handicap / 18.0)::integer
  END;

  -- Calculate base strokes for this hole
  IF player_handicap >= hole_si THEN
    strokes := strokes + 1;
  END IF;

  -- Add extra strokes if handicap is high enough
  IF player_handicap >= (hole_si + total_holes) THEN
    strokes := strokes + 1;
  END IF;

  -- Ensure we don't exceed max strokes per hole
  RETURN LEAST(strokes, max_strokes);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to initialize scorecard scores for a player
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
      0, -- Initial strokes is 0
      calculate_handicap_strokes(p_handicap, v_hole.si, v_total_holes)
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to handle player addition
CREATE OR REPLACE FUNCTION handle_scorecard_player_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Initialize scores for the new player
  PERFORM initialize_player_scores(
    NEW.scorecard_id,
    NEW.player_id,
    COALESCE(NEW.handicap, 0)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS on_scorecard_player_insert ON scorecard_players;
CREATE TRIGGER on_scorecard_player_insert
  AFTER INSERT ON scorecard_players
  FOR EACH ROW
  EXECUTE FUNCTION handle_scorecard_player_insert();

-- Add handicap_strokes column to scorecard_scores if it doesn't exist
ALTER TABLE scorecard_scores
ADD COLUMN IF NOT EXISTS handicap_strokes integer NOT NULL DEFAULT 0;