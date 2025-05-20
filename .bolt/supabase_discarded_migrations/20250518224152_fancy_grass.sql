-- Update the calculate_team_handicap_strokes function to handle single player teams
CREATE OR REPLACE FUNCTION calculate_team_handicap_strokes(
  team_handicap numeric,
  hole_handicap integer,
  total_holes integer DEFAULT 18
) RETURNS integer AS $$
DECLARE
  handicap_strokes integer := 0;
BEGIN
  -- If either value is null, return 0
  IF team_handicap IS NULL OR hole_handicap IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Calculate how many strokes this player gets on this hole
  -- For handicaps above 18, they get extra strokes on the lowest SI holes
  IF team_handicap >= hole_handicap THEN
    handicap_strokes := 1;
  END IF;
  
  -- For handicaps above 18, calculate additional strokes
  IF team_handicap > 18 THEN
    -- Calculate how many extra strokes they get (for handicaps > 18)
    -- Example: handicap 24 means they get an extra stroke on holes with SI 1-6
    IF hole_handicap <= (team_handicap - 18) THEN
      handicap_strokes := handicap_strokes + 1;
    END IF;
  END IF;
  
  -- For very high handicaps (36+), give 2 strokes on all holes
  IF team_handicap >= 36 THEN
    handicap_strokes := 2;
  END IF;
  
  RETURN handicap_strokes;
END;
$$ LANGUAGE plpgsql;

-- Update the create_team_scorecard function to allow single player teams
CREATE OR REPLACE FUNCTION create_team_scorecard(
  p_course_id uuid,
  p_created_by uuid,
  p_date date,
  p_weather text,
  p_game_type text,
  p_teams jsonb
) RETURNS jsonb AS $$
DECLARE
  v_scorecard_id uuid;
  v_team_id uuid;
  v_team jsonb;
  v_player_id uuid;
  v_team_name text;
  v_team_handicap numeric;
  v_player_ids jsonb;
  v_hole record;
  v_handicap_strokes integer;
BEGIN
  -- Create the scorecard
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
  
  -- Process each team
  FOR v_team IN SELECT * FROM jsonb_array_elements(p_teams)
  LOOP
    -- Create the team
    v_team_name := v_team->>'name';
    v_team_handicap := (v_team->>'handicap')::numeric;
    v_player_ids := v_team->'playerIds';
    
    INSERT INTO teams (
      name,
      created_by,
      handicap
    ) VALUES (
      v_team_name,
      p_created_by,
      v_team_handicap
    ) RETURNING id INTO v_team_id;
    
    -- Add players to the team and scorecard
    FOR v_player_id IN SELECT * FROM jsonb_array_elements_text(v_player_ids)
    LOOP
      -- Add player to scorecard
      INSERT INTO scorecard_players (
        scorecard_id,
        player_id,
        team_id,
        handicap
      ) VALUES (
        v_scorecard_id,
        v_player_id::uuid,
        v_team_id,
        (SELECT handicap FROM profiles WHERE id = v_player_id::uuid)
      );
      
      -- Update team member columns
      EXECUTE format('
        UPDATE teams 
        SET member_%s = $1
        WHERE id = $2
      ', 
        (SELECT COUNT(*) FROM teams 
         WHERE id = v_team_id AND 
         (member_1 IS NOT NULL OR member_2 IS NOT NULL OR 
          member_3 IS NOT NULL OR member_4 IS NOT NULL)) + 1
      ) USING v_player_id::uuid, v_team_id;
    END LOOP;
    
    -- Create team scores for each hole
    FOR v_hole IN 
      SELECT hole_number, par, handicap 
      FROM course_holes 
      WHERE course_id = p_course_id
      ORDER BY hole_number
    LOOP
      -- Calculate handicap strokes for this hole
      v_handicap_strokes := calculate_team_handicap_strokes(v_team_handicap, v_hole.handicap);
      
      -- Insert team score
      INSERT INTO scorecard_team_scores (
        scorecard_id,
        team_id,
        hole_number,
        hole_par,
        hole_si,
        handicap_strokes
      ) VALUES (
        v_scorecard_id,
        v_team_id,
        v_hole.hole_number,
        v_hole.par,
        v_hole.handicap,
        v_handicap_strokes
      );
    END LOOP;
  END LOOP;
  
  RETURN jsonb_build_object(
    'id', v_scorecard_id,
    'course_id', p_course_id
  );
END;
$$ LANGUAGE plpgsql;