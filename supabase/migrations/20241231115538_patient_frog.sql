/*
  # Add country field to profiles

  1. Changes
    - Add country column to profiles table
*/

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS country text;