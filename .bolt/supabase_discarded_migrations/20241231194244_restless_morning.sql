-- Drop and recreate the function with better error handling
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
  v_invalid_players uuid[];
BEGIN
  -- Get course name
  SELECT name INTO v_course_name
  FROM courses
  WHERE id = p_course_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Course not found';
  END IF;

  -- Find any invalid player IDs
  SELECT array_agg(p.id)
  INTO v_invalid_players
  FROM unnest(p_player_ids) p(id)
  LEFT JOIN profiles pr ON pr.id = p.id
  WHERE pr.id IS NULL;

  IF v_invalid_players IS NOT NULL THEN
    RAISE EXCEPTION 'Invalid player IDs found: %', v_invalid_players;
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