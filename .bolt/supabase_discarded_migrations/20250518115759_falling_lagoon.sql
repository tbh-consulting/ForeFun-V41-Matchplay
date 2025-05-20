/*
  # Add Game Type Selection to Scorecards

  1. Changes
    - Add game_type enum type
    - Add game_type column to scorecards table
    - Add team_id column to scorecard_players table
    - Update create_scorecard function to support game types
  
  2. Security
    - Maintain existing RLS policies
*/

-- Create game type enum
CREATE TYPE game_type AS ENUM (
  'strokeplay',
  'scramble',
  '4ball'
);

-- Add game_type column to scorecards table
ALTER TABLE scorecards
ADD COLUMN game_type game_type NOT NULL DEFAULT 'strokeplay';

-- Add team_id column to scorecard_players
ALTER TABLE scorecard_players
ADD COLUMN team_id uuid REFERENCES teams(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX idx_scorecard_players_team_id ON scorecard_players(team_id);

-- Update create_scorecard function to support game types
CREATE OR REPLACE FUNCTION create_scorecard(
  p_course_id uuid,
  p_created_by uuid,
  p_date timestamptz,
  p_weather weather_condition,
  p_game_type game_type DEFAULT 'strokeplay',
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_scorecard TO authenticated;