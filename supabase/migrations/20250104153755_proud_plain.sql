-- Drop all activity-related objects
DROP TABLE IF EXISTS activities CASCADE;
DROP TYPE IF EXISTS activity_type CASCADE;

-- Drop activity-related triggers
DROP TRIGGER IF EXISTS on_course_created ON courses;
DROP TRIGGER IF EXISTS on_scorecard_created ON scorecards;
DROP TRIGGER IF EXISTS on_friend_added ON friend_requests;
DROP TRIGGER IF EXISTS on_course_reviewed ON course_reviews;

-- Drop activity-related functions
DROP FUNCTION IF EXISTS handle_course_created() CASCADE;
DROP FUNCTION IF EXISTS handle_scorecard_created() CASCADE;
DROP FUNCTION IF EXISTS handle_friend_added() CASCADE;
DROP FUNCTION IF EXISTS handle_course_reviewed() CASCADE;

-- Drop the create_scorecard function and recreate it without activity tracking
DROP FUNCTION IF EXISTS create_scorecard(uuid, uuid, timestamptz, weather_condition, uuid[]);

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
  v_creator_handicap numeric;
  v_player record;
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
    WHERE id = ANY(p_player_ids);

    -- Initialize scores for each player
    FOR v_player IN 
      SELECT id, handicap 
      FROM profiles 
      WHERE id = ANY(p_player_ids)
    LOOP
      PERFORM initialize_player_scores(
        v_scorecard_id,
        v_player.id,
        v_player.handicap
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_scorecard TO authenticated;