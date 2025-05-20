-- Create function to handle scorecard creation with players
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
BEGIN
  -- Get course name
  SELECT name INTO v_course_name
  FROM courses
  WHERE id = p_course_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Course not found';
  END IF;

  -- Verify all players exist
  IF NOT EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = ANY(p_player_ids)
    HAVING count(*) = array_length(p_player_ids, 1)
  ) THEN
    RAISE EXCEPTION 'One or more players not found';
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

  -- Add players
  INSERT INTO scorecard_players (
    scorecard_id,
    player_id
  )
  SELECT 
    v_scorecard_id,
    unnest(p_player_ids);

  RETURN json_build_object(
    'scorecard_id', v_scorecard_id,
    'course_name', v_course_name
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Cleanup if anything fails
    IF v_scorecard_id IS NOT NULL THEN
      DELETE FROM scorecards WHERE id = v_scorecard_id;
    END IF;
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_scorecard TO authenticated;