-- Create function to handle team scorecard creation with proper initialization of team scores
CREATE OR REPLACE FUNCTION create_team_scorecard(
  p_course_id uuid,
  p_created_by uuid,
  p_date timestamptz,
  p_weather weather_condition,
  p_game_type game_type,
  p_teams jsonb DEFAULT '[]'::jsonb
) RETURNS json AS $$
DECLARE
  v_scorecard_id uuid;
  v_course_name text;
  v_team_id uuid;
  v_team_name text;
  v_team_handicap numeric;
  v_team jsonb;
  v_player_id uuid;
  v_player_ids uuid[];
BEGIN
  -- Get course name and validate course exists
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
    weather,
    game_type
  ) VALUES (
    p_course_id,
    p_created_by,
    p_date,
    p_weather,
    p_game_type
  ) RETURNING id INTO v_scorecard_id;

  -- Process teams if provided
  IF jsonb_array_length(p_teams) > 0 THEN
    FOR i IN 0..jsonb_array_length(p_teams)-1 LOOP
      v_team := p_teams->i;
      v_team_name := v_team->>'name';
      v_team_handicap := (v_team->>'handicap')::numeric;
      v_player_ids := ARRAY(SELECT jsonb_array_elements_text(v_team->'playerIds')::uuid);
      
      -- Create team
      INSERT INTO teams (
        name,
        created_by,
        handicap,
        member_1,
        member_2,
        member_3,
        member_4
      ) VALUES (
        v_team_name,
        p_created_by,
        v_team_handicap,
        v_player_ids[1],
        CASE WHEN array_length(v_player_ids, 1) >= 2 THEN v_player_ids[2] ELSE NULL END,
        CASE WHEN array_length(v_player_ids, 1) >= 3 THEN v_player_ids[3] ELSE NULL END,
        CASE WHEN array_length(v_player_ids, 1) >= 4 THEN v_player_ids[4] ELSE NULL END
      ) RETURNING id INTO v_team_id;
      
      -- Add players to scorecard_players with team_id
      FOREACH v_player_id IN ARRAY v_player_ids LOOP
        INSERT INTO scorecard_players (
          scorecard_id,
          player_id,
          team_id,
          handicap
        )
        SELECT 
          v_scorecard_id,
          id,
          v_team_id,
          handicap
        FROM profiles
        WHERE id = v_player_id;
      END LOOP;
      
      -- Initialize team scores for all holes - CRITICAL STEP
      PERFORM initialize_team_scores(v_scorecard_id, v_team_id, v_team_handicap);
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_team_scorecard TO authenticated;