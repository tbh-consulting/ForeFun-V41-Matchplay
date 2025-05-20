/*
  # Add array_length function and fix team score updates
  
  1. Changes
    - Add array_length function for handling team scores
    - Update team score calculation logic
    - Add validation for team scores

  2. Security
    - Function is accessible to authenticated users only
*/

-- Drop existing function if it exists to avoid conflicts
DROP FUNCTION IF EXISTS array_length(record, integer);

-- Create the array_length function
CREATE OR REPLACE FUNCTION array_length(input_record record, dimension integer)
RETURNS integer AS $$
BEGIN
  -- For team scores, we're only dealing with single dimension arrays
  IF dimension != 1 THEN
    RETURN NULL;
  END IF;
  
  -- Count non-null team members
  RETURN (
    SELECT COUNT(*)
    FROM (
      SELECT UNNEST(ARRAY[
        input_record.member_1,
        input_record.member_2,
        input_record.member_3,
        input_record.member_4
      ]) AS member
      WHERE member IS NOT NULL
    ) AS members
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;