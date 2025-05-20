/*
  # Update Handicap Column Type

  1. Changes
    - Modify handicap column to use numeric type with 1 decimal place
    - Add check constraint to ensure valid handicap range (-10 to 54)

  2. Notes
    - Using numeric type for precise decimal storage
    - Range follows official handicap system limits
*/

-- First drop the existing default value
ALTER TABLE profiles 
ALTER COLUMN handicap DROP DEFAULT;

-- Convert column to numeric with 1 decimal place
ALTER TABLE profiles 
ALTER COLUMN handicap TYPE numeric(4,1) USING handicap::numeric(4,1);

-- Add check constraint for valid handicap range
ALTER TABLE profiles
ADD CONSTRAINT valid_handicap_range 
  CHECK (handicap IS NULL OR (handicap >= -10 AND handicap <= 54));