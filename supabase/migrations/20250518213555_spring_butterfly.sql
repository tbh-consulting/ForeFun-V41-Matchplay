-- Create function to handle team scorecard creation
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
      v_player_ids := ARRAY(SELECT jsonb_array_elements_text(v_team->'playerIds')::uuid);
      
      -- Create team
      INSERT INTO teams (
        name,
        created_by,
        member_1,
        member_2,
        member_3,
        member_4
      ) VALUES (
        v_team_name,
        p_created_by,
        v_player_ids[1],
        CASE WHEN array_length(v_player_ids, 1) >= 2 THEN v_player_ids[2] ELSE NULL END,
        CASE WHEN array_length(v_player_ids, 1) >= 3 THEN v_player_ids[3] ELSE NULL END,
        CASE WHEN array_length(v_player_ids, 1) >= 4 THEN v_player_ids[4] ELSE NULL END
      ) RETURNING id INTO v_team_id;
      
      -- Get team handicap (calculated by trigger)
      SELECT handicap INTO v_team_handicap FROM teams WHERE id = v_team_id;
      
      -- Initialize team scores
      PERFORM initialize_team_scores(v_scorecard_id, v_team_id, v_team_handicap);
      
      -- Add players to scorecard_players with team_id
      FOREACH v_team_id IN ARRAY v_player_ids LOOP
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
        WHERE id = v_team_id;
      END LOOP;
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

-- Fix the create_scorecard function to handle team games properly
CREATE OR REPLACE FUNCTION create_scorecard(
  p_course_id uuid,
  p_created_by uuid,
  p_date timestamptz,
  p_weather weather_condition,
  p_game_type game_type DEFAULT 'strokeplay'::game_type,
  p_player_ids uuid[] DEFAULT '{}'::uuid[]
) RETURNS json AS $$
DECLARE
  v_scorecard_id uuid;
  v_course_name text;
  v_creator_handicap numeric;
  v_player record;
BEGIN
  -- For team games, delegate to create_team_scorecard
  IF p_game_type = 'scramble' OR p_game_type = '4ball' THEN
    -- Team games should be handled by create_team_scorecard
    RETURN json_build_object(
      'error', 'Team games should use create_team_scorecard function'
    );
  END IF;

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
    weather,
    game_type
  ) VALUES (
    p_course_id,
    p_created_by,
    p_date,
    p_weather,
    p_game_type
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

-- Fix the initialize_team_scores function to properly handle team handicap
CREATE OR REPLACE FUNCTION initialize_team_scores(
  p_scorecard_id uuid,
  p_team_id uuid,
  p_team_handicap numeric
) RETURNS void AS $$
DECLARE
  v_hole record;
  v_total_holes integer;
  v_handicap_strokes integer;
  v_team_handicap numeric;
  v_course_id uuid;
BEGIN
  -- Get course ID and total holes
  SELECT c.id, c.holes INTO v_course_id, v_total_holes
  FROM scorecards s
  JOIN courses c ON c.id = s.course_id
  WHERE s.id = p_scorecard_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Scorecard or course not found';
  END IF;

  -- Get team handicap from teams table if not provided
  IF p_team_handicap IS NULL THEN
    SELECT handicap INTO v_team_handicap FROM teams WHERE id = p_team_id;
  ELSE
    v_team_handicap := p_team_handicap;
  END IF;

  -- Ensure we have a valid handicap value
  IF v_team_handicap IS NULL THEN
    v_team_handicap := 0;
  END IF;

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
    FROM course_holes ch
    WHERE ch.course_id = v_course_id
    ORDER BY ch.hole_number
  ) LOOP
    -- Calculate handicap strokes for this hole
    v_handicap_strokes := calculate_team_handicap_strokes(v_team_handicap, v_hole.si, v_total_holes);
    
    -- Insert score record with all hole information
    INSERT INTO scorecard_team_scores (
      scorecard_id,
      team_id,
      hole_number,
      gross_score,
      points,
      handicap_strokes,
      hole_par,
      hole_si,
      -- Distances in meters
      hole_distance_black_meters,
      hole_distance_white_meters,
      hole_distance_yellow_meters,
      hole_distance_blue_meters,
      hole_distance_red_meters,
      -- Distances in yards
      hole_distance_black_yards,
      hole_distance_white_yards,
      hole_distance_yellow_yards,
      hole_distance_blue_yards,
      hole_distance_red_yards
    ) VALUES (
      p_scorecard_id,
      p_team_id,
      v_hole.hole_number,
      NULL,
      NULL,
      v_handicap_strokes,
      v_hole.par,
      v_hole.si,
      -- Meters
      v_hole.distance_black_meters,
      v_hole.distance_white_meters,
      v_hole.distance_yellow_meters,
      v_hole.distance_blue_meters,
      v_hole.distance_red_meters,
      -- Yards
      v_hole.distance_black_yards,
      v_hole.distance_white_yards,
      v_hole.distance_yellow_yards,
      v_hole.distance_blue_yards,
      v_hole.distance_red_yards
    )
    ON CONFLICT (scorecard_id, team_id, hole_number) DO UPDATE
    SET 
      handicap_strokes = v_handicap_strokes,
      hole_par = v_hole.par,
      hole_si = v_hole.si;
  END LOOP;
END;
$$ LANGUAGE plpgsql;