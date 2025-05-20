/*
  # Add Scorecard ID to Teams Table

  1. Changes
    - Add scorecard_id column to teams table
    - Update team creation to include scorecard_id
    - Modify match play calculation to use scorecard_id relationship
    - Fix existing teams to have the correct scorecard_id

  2. Impact
    - Simplifies match play total calculation
    - Improves performance by avoiding complex joins
    - Makes it easier to find all teams for a specific scorecard
*/

-- Add scorecard_id column to teams table
ALTER TABLE teams
ADD COLUMN IF NOT EXISTS scorecard_id uuid REFERENCES scorecards(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_teams_scorecard_id ON teams(scorecard_id);

-- Update existing teams with their scorecard_id
UPDATE teams t
SET scorecard_id = sp.scorecard_id
FROM scorecard_players sp
WHERE sp.team_id = t.id
AND t.scorecard_id IS NULL
AND sp.team_id IS NOT NULL;

-- Simplify the match play total calculation function
CREATE OR REPLACE FUNCTION calculate_team_match_play_total()
RETURNS TRIGGER AS $$
DECLARE
  v_scorecard_id uuid;
BEGIN
  -- Get the scorecard ID
  v_scorecard_id := NEW.scorecard_id;
  
  -- Update match_play_total for ALL teams in this scorecard
  UPDATE teams
  SET match_play_total = (
    SELECT COALESCE(SUM(match_play_status), 0)
    FROM scorecard_team_scores
    WHERE team_id = teams.id
      AND scorecard_id = v_scorecard_id
  )
  WHERE scorecard_id = v_scorecard_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Simplify the team score deletion handler
CREATE OR REPLACE FUNCTION handle_team_score_deletion()
RETURNS TRIGGER AS $$
DECLARE
  v_scorecard_id uuid;
BEGIN
  -- Get the scorecard ID
  v_scorecard_id := OLD.scorecard_id;
  
  -- Update match_play_total for ALL teams in this scorecard
  UPDATE teams
  SET match_play_total = (
    SELECT COALESCE(SUM(match_play_status), 0)
    FROM scorecard_team_scores
    WHERE team_id = teams.id
      AND scorecard_id = v_scorecard_id
  )
  WHERE scorecard_id = v_scorecard_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Update the create_team_scorecard function to set scorecard_id
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
      
      -- Create team with scorecard_id
      INSERT INTO teams (
        name,
        created_by,
        handicap,
        member_1,
        member_2,
        member_3,
        member_4,
        scorecard_id  -- Add scorecard_id here
      ) VALUES (
        v_team_name,
        p_created_by,
        v_team_handicap,
        v_player_ids[1],
        CASE WHEN array_length(v_player_ids, 1) >= 2 THEN v_player_ids[2] ELSE NULL END,
        CASE WHEN array_length(v_player_ids, 1) >= 3 THEN v_player_ids[3] ELSE NULL END,
        CASE WHEN array_length(v_player_ids, 1) >= 4 THEN v_player_ids[4] ELSE NULL END,
        v_scorecard_id  -- Set the scorecard_id
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
      
      -- Initialize team scores for all holes
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

-- Function to recalculate match play totals for all teams in a scorecard
CREATE OR REPLACE FUNCTION recalculate_scorecard_match_play_totals(p_scorecard_id uuid)
RETURNS void AS $$
BEGIN
  -- Update match_play_total for ALL teams in this scorecard
  UPDATE teams
  SET match_play_total = (
    SELECT COALESCE(SUM(match_play_status), 0)
    FROM scorecard_team_scores
    WHERE team_id = teams.id
      AND scorecard_id = p_scorecard_id
  )
  WHERE scorecard_id = p_scorecard_id;
END;
$$ LANGUAGE plpgsql;

-- Recalculate match play totals for all existing scorecards
DO $$
DECLARE
  scorecard_rec RECORD;
BEGIN
  FOR scorecard_rec IN (
    SELECT DISTINCT scorecard_id
    FROM scorecard_team_scores
  ) LOOP
    PERFORM recalculate_scorecard_match_play_totals(scorecard_rec.scorecard_id);
  END LOOP;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION calculate_team_match_play_total TO authenticated;
GRANT EXECUTE ON FUNCTION handle_team_score_deletion TO authenticated;
GRANT EXECUTE ON FUNCTION recalculate_scorecard_match_play_totals TO authenticated;
GRANT EXECUTE ON FUNCTION create_team_scorecard TO authenticated;