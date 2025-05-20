/*
  # Add dog policy to courses

  1. Changes
    - Add dog_policy enum type
    - Add dog_policy column to courses table with default value
    - Update existing courses to have default value
*/

-- Create enum type for dog policy
CREATE TYPE dog_policy AS ENUM ('yes', 'no', 'na');

-- Add dog_policy column to courses table
ALTER TABLE courses
ADD COLUMN dog_policy dog_policy NOT NULL DEFAULT 'na';

-- Update existing courses to have default value
UPDATE courses SET dog_policy = 'na' WHERE dog_policy IS NULL;