-- Drop existing handicap calculation function if it exists
DROP FUNCTION IF EXISTS calculate_handicap_strokes(numeric, integer, integer);

-- Create new handicap calculation function
CREATE OR REPLACE FUNCTION calculate_handicap_strokes(
  player_handicap numeric,
  hole_si integer,
  total_holes integer DEFAULT 18
) RETURNS integer AS $$
DECLARE
  base_strokes integer;
  extra_strokes integer;
  remaining_handicap integer;
BEGIN
  -- Return 0 if no handicap or SI
  IF player_handicap IS NULL OR hole_si IS NULL THEN
    RETURN 0;
  END IF;

  -- For handicaps above 36, give 2 strokes per hole
  IF player_handicap >= 36 THEN
    RETURN 2;
  END IF;

  -- Calculate base strokes (1 stroke if handicap >= hole SI)
  base_strokes := CASE 
    WHEN player_handicap >= hole_si THEN 1
    ELSE 0
  END;

  -- Calculate extra strokes for higher handicaps
  IF player_handicap > 18 THEN
    -- Calculate how many holes get an extra stroke
    -- Example: handicap 24 means SI 1-6 get an extra stroke
    remaining_handicap := player_handicap - 18;
    
    -- Add extra stroke if this hole's SI is low enough
    extra_strokes := CASE 
      WHEN hole_si <= remaining_handicap THEN 1
      ELSE 0
    END;
  ELSE
    extra_strokes := 0;
  END IF;

  RETURN base_strokes + extra_strokes;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Test the function
DO $$
BEGIN
  -- Test handicap 36 (should get 2 strokes on all holes)
  ASSERT calculate_handicap_strokes(36, 1) = 2;
  ASSERT calculate_handicap_strokes(36, 18) = 2;

  -- Test handicap 16 (should get 1 stroke on holes 1-16)
  ASSERT calculate_handicap_strokes(16, 1) = 1;
  ASSERT calculate_handicap_strokes(16, 16) = 1;
  ASSERT calculate_handicap_strokes(16, 17) = 0;

  -- Test handicap 24 (1 stroke on all holes + extra stroke on SI 1-6)
  ASSERT calculate_handicap_strokes(24, 1) = 2;  -- SI 1 gets 2 strokes
  ASSERT calculate_handicap_strokes(24, 6) = 2;  -- SI 6 gets 2 strokes
  ASSERT calculate_handicap_strokes(24, 7) = 1;  -- SI 7 gets 1 stroke
  ASSERT calculate_handicap_strokes(24, 18) = 1; -- SI 18 gets 1 stroke

  -- Test handicap 28 (1 stroke on all holes + extra stroke on SI 1-10)
  ASSERT calculate_handicap_strokes(28, 1) = 2;  -- SI 1 gets 2 strokes
  ASSERT calculate_handicap_strokes(28, 10) = 2; -- SI 10 gets 2 strokes
  ASSERT calculate_handicap_strokes(28, 11) = 1; -- SI 11 gets 1 stroke
  ASSERT calculate_handicap_strokes(28, 18) = 1; -- SI 18 gets 1 stroke
END $$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION calculate_handicap_strokes TO authenticated;