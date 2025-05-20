-- Drop existing problematic policies and functions
DROP POLICY IF EXISTS "Players and creators can manage scores" ON scorecard_scores;
DROP POLICY IF EXISTS "Anyone can view scores" ON scorecard_scores;
DROP FUNCTION IF EXISTS create_scorecard(uuid, uuid, timestamptz, weather_condition, uuid[]);
DROP FUNCTION IF EXISTS initialize_player_scores(uuid, uuid, numeric);

-- Recreate policies with proper permissions
CREATE POLICY "Anyone can view scores"
  ON scorecard_scores FOR SELECT
  USING (true);

CREATE POLICY "Players and creators can manage scores"
  ON scorecard_scores 
  FOR ALL
  USING (
    player_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM scorecards
      WHERE id = scorecard_id
      AND created_by = auth.uid()
    )
  );

-- Create function to safely initialize player scores
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
    -- Only insert if record doesn't exist
    INSERT INTO scorecard_scores (
      scorecard_id,
      player_id,
      hole_number,
      handicap_strokes,
      gross_score,
      points,
      hole_par,
      hole_si,
      hole_distance_black_meters,
      hole_distance_white_meters,
      hole_distance_yellow_meters,
      hole_distance_blue_meters,
      hole_distance_red_meters,
      hole_distance_black_yards,
      hole_distance_white_yards,
      hole_distance_yellow_yards,
      hole_distance_blue_yards,
      hole_distance_red_yards
    )
    SELECT
      p_scorecard_id,
      p_player_id,
      v_hole.hole_number,
      calculate_handicap_strokes(p_handicap, v_hole.si, v_total_holes),
      NULL,
      NULL,
      v_hole.par,
      v_hole.si,
      v_hole.distance_black_meters,
      v_hole.distance_white_meters,
      v_hole.distance_yellow_meters,
      v_hole.distance_blue_meters,
      v_hole.distance_red_meters,
      v_hole.distance_black_yards,
      v_hole.distance_white_yards,
      v_hole.distance_yellow_yards,
      v_hole.distance_blue_yards,
      v_hole.distance_red_yards
    WHERE NOT EXISTS (
      SELECT 1 FROM scorecard_scores
      WHERE scorecard_id = p_scorecard_id
      AND player_id = p_player_id
      AND hole_number = v_hole.hole_number
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create function to create scorecard with proper error handling
CREATE OR REPLACE FUNCTION create_scorecard(
  p_course_id uuid,
  p_created_by uuid,
  p_date timestamptz,
  p_weather weather_condition,
  p_player_ids uuid[] DEFAULT '{}'::uuid[]
) RETURNS json AS $$
DECLARE
  v_scorecard_id uuid;
  v_course_name text;
  v_player_id uuid;
  v_creator_handicap numeric;
BEGIN
  -- Get course name and validate course exists
  SELECT name INTO v_course_name
  FROM courses
  WHERE id = p_course_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Course not found';
  END IF;

  -- Get creator's handicap
  SELECT handicap INTO v_creator_handicap
  FROM profiles
  WHERE id = p_created_by;

  -- Create scorecard
  INSERT INTO scorecards (
    course_id,
    created_by,
    date,
    weather
  ) VALUES (
    p_course_id,
    p_created_by,
    p_date,
    p_weather
  ) RETURNING id INTO v_scorecard_id;

  -- Add creator as player
  INSERT INTO scorecard_players (
    scorecard_id,
    player_id,
    handicap
  ) VALUES (
    v_scorecard_id,
    p_created_by,
    v_creator_handicap
  );

  -- Initialize scores for creator
  PERFORM initialize_player_scores(
    v_scorecard_id,
    p_created_by,
    v_creator_handicap
  );

  -- Add other players if any
  IF array_length(p_player_ids, 1) > 0 THEN
    FOREACH v_player_id IN ARRAY p_player_ids
    LOOP
      -- Add player with their current handicap
      INSERT INTO scorecard_players (
        scorecard_id,
        player_id,
        handicap
      )
      SELECT 
        v_scorecard_id,
        id,
        handicap
      FROM profiles
      WHERE id = v_player_id;

      -- Initialize scores for player
      PERFORM initialize_player_scores(
        v_scorecard_id,
        v_player_id,
        (SELECT handicap FROM profiles WHERE id = v_player_id)
      );
    END LOOP;
  END IF;

  RETURN json_build_object(
    'id', v_scorecard_id,
    'course_name', v_course_name
  );

EXCEPTION WHEN OTHERS THEN
  -- Cleanup if anything fails
  IF v_scorecard_id IS NOT NULL THEN
    DELETE FROM scorecards WHERE id = v_scorecard_id;
  END IF;
  RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION create_scorecard TO authenticated;
GRANT EXECUTE ON FUNCTION initialize_player_scores TO authenticated;