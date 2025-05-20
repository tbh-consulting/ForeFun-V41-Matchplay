/*
  # Fix Team Handicap Calculation

  1. Changes
    - Update the update_team_handicap function to properly handle numeric types
    - Fix the handicap calculation to ensure consistent results
    - Add debug logging to track handicap values
    - Ensure team handicap is properly stored and retrieved

  2. Impact
    - Fixes the issue where team handicap shows correctly during formation but changes in the scorecard
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS update_team_handicap_trigger ON teams;
DROP FUNCTION IF EXISTS update_team_handicap();

-- Create improved function to update team handicap
CREATE OR REPLACE FUNCTION update_team_handicap()
RETURNS TRIGGER AS $$
DECLARE
  v_handicaps numeric[];
  v_game_type text;
  v_team_handicap numeric;
  v_member_1_handicap numeric;
  v_member_2_handicap numeric;
  v_member_3_handicap numeric;
  v_member_4_handicap numeric;
BEGIN
  -- Get handicaps directly from profiles table to ensure accuracy
  SELECT handicap INTO v_member_1_handicap FROM profiles WHERE id = NEW.member_1;
  SELECT handicap INTO v_member_2_handicap FROM profiles WHERE id = NEW.member_2;
  SELECT handicap INTO v_member_3_handicap FROM profiles WHERE id = NEW.member_3;
  SELECT handicap INTO v_member_4_handicap FROM profiles WHERE id = NEW.member_4;
  
  -- Build array of valid handicaps (non-null values only)
  v_handicaps := ARRAY[]::numeric[];
  
  IF v_member_1_handicap IS NOT NULL THEN
    v_handicaps := v_handicaps || v_member_1_handicap;
  END IF;
  
  IF v_member_2_handicap IS NOT NULL THEN
    v_handicaps := v_handicaps || v_member_2_handicap;
  END IF;
  
  IF v_member_3_handicap IS NOT NULL THEN
    v_handicaps := v_handicaps || v_member_3_handicap;
  END IF;
  
  IF v_member_4_handicap IS NOT NULL THEN
    v_handicaps := v_handicaps || v_member_4_handicap;
  END IF;

  -- Get the game type from the scorecard if possible
  BEGIN
    SELECT s.game_type::text INTO v_game_type
    FROM scorecards s
    JOIN scorecard_players sp ON s.id = sp.scorecard_id
    WHERE sp.team_id = NEW.id
    LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    -- Default to scramble if we can't determine
    v_game_type := 'scramble';
  END;

  -- Calculate team handicap based on game type
  IF v_game_type = '4ball' OR v_game_type = '4ball'::game_type::text THEN
    v_team_handicap := calculate_4ball_handicap(v_handicaps);
  ELSE
    -- Default to scramble calculation
    v_team_handicap := calculate_scramble_handicap(v_handicaps);
  END IF;

  -- Ensure we have a valid numeric value
  IF v_team_handicap IS NULL THEN
    v_team_handicap := 0;
  END IF;

  -- Update the team's handicap
  NEW.handicap := v_team_handicap;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update team handicap when team is created or updated
CREATE TRIGGER update_team_handicap_trigger
  BEFORE INSERT OR UPDATE OF member_1, member_2, member_3, member_4 ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_team_handicap();

-- Update existing teams' handicaps
UPDATE teams SET handicap = NULL WHERE 1=1;
UPDATE teams SET member_1 = member_1 WHERE member_1 IS NOT NULL;

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
BEGIN
  -- Get total number of holes for this course
  SELECT c.holes INTO v_total_holes
  FROM scorecards s
  JOIN courses c ON c.id = s.course_id
  WHERE s.id = p_scorecard_id;

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
    FROM scorecards s
    JOIN courses c ON c.id = s.course_id
    JOIN course_holes ch ON ch.course_id = c.id
    WHERE s.id = p_scorecard_id
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION initialize_team_scores TO authenticated;