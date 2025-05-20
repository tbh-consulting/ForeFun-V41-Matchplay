-- Add handicap column to teams table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'teams'
    AND column_name = 'handicap'
  ) THEN
    ALTER TABLE teams
    ADD COLUMN handicap numeric(4,1) DEFAULT NULL::numeric;
  END IF;
END$$;

-- Create function to update team handicap when members change
CREATE OR REPLACE FUNCTION update_team_handicap()
RETURNS TRIGGER AS $$
DECLARE
  v_handicaps numeric[];
  v_game_type text;
  v_team_handicap numeric;
BEGIN
  -- Get the game type from the scorecard
  SELECT game_type::text INTO v_game_type
  FROM scorecards s
  JOIN scorecard_players sp ON s.id = sp.scorecard_id
  WHERE sp.team_id = NEW.id
  LIMIT 1;

  -- Collect handicaps from team members
  v_handicaps := ARRAY(
    SELECT p.handicap
    FROM profiles p
    WHERE p.id IN (NEW.member_1, NEW.member_2, NEW.member_3, NEW.member_4)
    AND p.handicap IS NOT NULL
  );

  -- Calculate team handicap based on game type
  IF v_game_type = 'scramble' THEN
    v_team_handicap := calculate_scramble_handicap(v_handicaps);
  ELSIF v_game_type = '4ball' THEN
    v_team_handicap := calculate_4ball_handicap(v_handicaps);
  ELSE
    -- Default to average handicap
    SELECT COALESCE(AVG(h), 0) INTO v_team_handicap
    FROM unnest(v_handicaps) AS h;
    v_team_handicap := ROUND(v_team_handicap);
  END IF;

  -- Update the team's handicap
  NEW.handicap := v_team_handicap;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update team handicap when team is created or updated
DROP TRIGGER IF EXISTS update_team_handicap_trigger ON teams;
CREATE TRIGGER update_team_handicap_trigger
  BEFORE INSERT OR UPDATE OF member_1, member_2, member_3, member_4 ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_team_handicap();

-- Update existing teams' handicaps
DO $$
DECLARE
  team_record RECORD;
  member_handicaps numeric[];
  game_type text;
  team_handicap numeric;
BEGIN
  FOR team_record IN SELECT * FROM teams WHERE handicap IS NULL LOOP
    -- Collect handicaps from team members
    SELECT ARRAY(
      SELECT p.handicap
      FROM profiles p
      WHERE p.id IN (team_record.member_1, team_record.member_2, team_record.member_3, team_record.member_4)
      AND p.handicap IS NOT NULL
    ) INTO member_handicaps;
    
    -- Get the game type from the scorecard
    SELECT s.game_type::text INTO game_type
    FROM scorecards s
    JOIN scorecard_players sp ON s.id = sp.scorecard_id
    WHERE sp.team_id = team_record.id
    LIMIT 1;
    
    -- Calculate team handicap based on game type
    IF game_type = 'scramble' THEN
      team_handicap := calculate_scramble_handicap(member_handicaps);
    ELSIF game_type = '4ball' THEN
      team_handicap := calculate_4ball_handicap(member_handicaps);
    ELSE
      -- Default to average handicap
      SELECT COALESCE(AVG(h), 0) INTO team_handicap
      FROM unnest(member_handicaps) AS h;
      team_handicap := ROUND(team_handicap);
    END IF;
    
    -- Update the team's handicap
    UPDATE teams
    SET handicap = team_handicap
    WHERE id = team_record.id;
  END LOOP;
END$$;