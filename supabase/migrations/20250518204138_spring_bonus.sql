/*
  # Update Team Handicap Calculation

  1. Changes
    - Add handicap column to teams table
    - Update team handicap calculation to use rounded values
    - Add function to calculate team handicap strokes for holes

  2. Security
    - Maintain existing RLS policies
*/

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
    ADD COLUMN handicap numeric(4,1) DEFAULT NULL;
  END IF;
END$$;

-- Create function to calculate team handicap for scramble format
CREATE OR REPLACE FUNCTION calculate_scramble_handicap(player_handicaps numeric[])
RETURNS integer AS $$
DECLARE
  lowest_handicap numeric;
  highest_handicap numeric;
  team_handicap numeric;
BEGIN
  -- Handle empty array
  IF array_length(player_handicaps, 1) IS NULL OR array_length(player_handicaps, 1) = 0 THEN
    RETURN 0;
  END IF;

  -- Handle single player
  IF array_length(player_handicaps, 1) = 1 THEN
    RETURN ROUND(player_handicaps[1]);
  END IF;

  -- Sort handicaps
  SELECT MIN(h), MAX(h) INTO lowest_handicap, highest_handicap
  FROM unnest(player_handicaps) AS h;

  -- Calculate team handicap: 35% of lowest + 15% of highest
  team_handicap := (lowest_handicap * 0.35) + (highest_handicap * 0.15);
  
  -- Round to nearest integer
  RETURN ROUND(team_handicap);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to calculate team handicap for 4-ball format
CREATE OR REPLACE FUNCTION calculate_4ball_handicap(player_handicaps numeric[])
RETURNS integer AS $$
DECLARE
  lowest_handicap numeric;
  highest_handicap numeric;
  team_handicap numeric;
BEGIN
  -- Handle empty array
  IF array_length(player_handicaps, 1) IS NULL OR array_length(player_handicaps, 1) = 0 THEN
    RETURN 0;
  END IF;

  -- Handle single player
  IF array_length(player_handicaps, 1) = 1 THEN
    RETURN ROUND(player_handicaps[1] * 0.9);
  END IF;

  -- Sort handicaps
  SELECT MIN(h), MAX(h) INTO lowest_handicap, highest_handicap
  FROM unnest(player_handicaps) AS h;

  -- Calculate team handicap: 90% of lowest + 10% of highest
  team_handicap := (lowest_handicap * 0.9) + (highest_handicap * 0.1);
  
  -- Round to nearest integer
  RETURN ROUND(team_handicap);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to calculate team handicap strokes for a hole
CREATE OR REPLACE FUNCTION calculate_team_handicap_strokes(
  team_handicap numeric,
  hole_si integer,
  total_holes integer DEFAULT 18
)
RETURNS integer AS $$
DECLARE
  base_strokes integer;
  extra_strokes integer;
BEGIN
  -- Return 0 if no handicap or SI
  IF team_handicap IS NULL OR hole_si IS NULL THEN
    RETURN 0;
  END IF;

  -- Calculate base strokes (1 stroke if handicap >= hole SI)
  base_strokes := CASE 
    WHEN team_handicap >= hole_si THEN 1
    ELSE 0
  END;

  -- Calculate extra strokes for higher handicaps
  IF team_handicap > 18 THEN
    -- Calculate how many holes get an extra stroke
    -- Example: handicap 24 means SI 1-6 get an extra stroke
    extra_strokes := CASE 
      WHEN hole_si <= (team_handicap - 18) THEN 1
      ELSE 0
    END;
  ELSE
    extra_strokes := 0;
  END IF;

  RETURN base_strokes + extra_strokes;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION calculate_scramble_handicap TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_4ball_handicap TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_team_handicap_strokes TO authenticated;