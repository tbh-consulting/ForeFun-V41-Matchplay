-- Drop existing problematic policies
DROP POLICY IF EXISTS "Players can manage scores" ON scorecard_scores;
DROP POLICY IF EXISTS "Players and creators can update scores" ON scorecard_scores;
DROP POLICY IF EXISTS "Anyone can view scores" ON scorecard_scores;

-- Recreate policies with proper permissions
CREATE POLICY "Anyone can view scores"
  ON scorecard_scores FOR SELECT
  USING (true);

CREATE POLICY "Players and creators can manage scores"
  ON scorecard_scores 
  USING (
    player_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM scorecards
      WHERE id = scorecard_id
      AND created_by = auth.uid()
    )
  );

-- Update create_scorecard function to handle initialization properly
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
    'scorecard_id', v_scorecard_id,
    'course_name', v_course_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION create_scorecard TO authenticated;