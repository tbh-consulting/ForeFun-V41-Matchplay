-- Drop existing problematic policies
DROP POLICY IF EXISTS "Players can add their own scores" ON scorecard_scores;
DROP POLICY IF EXISTS "Players can update their own scores" ON scorecard_scores;
DROP POLICY IF EXISTS "Scorecard creator can add players" ON scorecard_players;

-- Update scorecard_scores policies
CREATE POLICY "Players can manage scores"
  ON scorecard_scores
  USING (
    -- Player can manage their own scores OR creator can manage all scores
    player_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM scorecards
      WHERE id = scorecard_id
      AND created_by = auth.uid()
    )
  );

-- Update scorecard_players policies
CREATE POLICY "Creator can manage players"
  ON scorecard_players
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM scorecards
      WHERE id = scorecard_id
      AND created_by = auth.uid()
    )
  );

-- Update create_scorecard function to handle player scores initialization
CREATE OR REPLACE FUNCTION create_scorecard(
  p_course_id uuid,
  p_created_by uuid,
  p_date timestamptz,
  p_weather weather_condition,
  p_player_ids uuid[]
) RETURNS json AS $$
DECLARE
  v_scorecard_id uuid;
  v_course_name text;
  v_player_id uuid;
BEGIN
  -- Get course name
  SELECT name INTO v_course_name
  FROM courses
  WHERE id = p_course_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Course not found';
  END IF;

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

  -- Add creator as player with their current handicap
  INSERT INTO scorecard_players (
    scorecard_id,
    player_id,
    handicap
  )
  SELECT 
    v_scorecard_id,
    p_created_by,
    handicap
  FROM profiles
  WHERE id = p_created_by;

  -- Initialize scores for creator
  PERFORM initialize_player_scores(v_scorecard_id, p_created_by, (
    SELECT handicap FROM profiles WHERE id = p_created_by
  ));

  -- Add other players if any
  IF array_length(p_player_ids, 1) > 0 THEN
    FOREACH v_player_id IN ARRAY p_player_ids
    LOOP
      -- Add player
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
      PERFORM initialize_player_scores(v_scorecard_id, v_player_id, (
        SELECT handicap FROM profiles WHERE id = v_player_id
      ));
    END LOOP;
  END IF;

  RETURN json_build_object(
    'scorecard_id', v_scorecard_id,
    'course_name', v_course_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;