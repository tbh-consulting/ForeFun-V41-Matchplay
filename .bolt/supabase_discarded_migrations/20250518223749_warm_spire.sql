/*
  # Remove 4ball game type

  This migration removes the '4ball' game type from the game_type enum and updates
  any existing scorecards that use this game type to use 'scramble' instead.
  
  1. Changes
     - Updates any scorecards with game_type '4ball' to use 'scramble'
     - Alters the game_type enum to remove the '4ball' option
*/

-- Update any existing scorecards with game_type '4ball' to use 'scramble'
UPDATE scorecards
SET game_type = 'scramble'
WHERE game_type = '4ball';

-- Create a new enum type without the '4ball' option
CREATE TYPE game_type_new AS ENUM ('strokeplay', 'scramble');

-- Update the column to use the new enum type
ALTER TABLE scorecards
  ALTER COLUMN game_type TYPE game_type_new
  USING game_type::text::game_type_new;

-- Drop the old enum type
DROP TYPE game_type;

-- Rename the new enum type to the original name
ALTER TYPE game_type_new RENAME TO game_type;

-- Update the calculate_team_handicap function to remove the 4ball option
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