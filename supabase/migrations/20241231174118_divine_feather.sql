/*
  # Add Golf Stats to User Profile

  1. Changes
    - Add best_score and rounds_played columns to profiles table
    - Set default values for new columns
    - Add check constraints for valid values

  2. Notes
    - best_score must be between 1 and 200
    - rounds_played must be non-negative
*/

ALTER TABLE profiles
ADD COLUMN best_score integer DEFAULT NULL,
ADD COLUMN rounds_played integer DEFAULT 0;

-- Add check constraints
ALTER TABLE profiles
ADD CONSTRAINT valid_best_score 
  CHECK (best_score IS NULL OR (best_score >= 1 AND best_score <= 200)),
ADD CONSTRAINT valid_rounds_played
  CHECK (rounds_played >= 0);