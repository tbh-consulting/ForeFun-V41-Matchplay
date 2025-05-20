/*
  # Add Distance Conversion Functions

  1. New Functions
    - convert_distance_meters_to_yards: Converts meters to yards
    - convert_distance_yards_to_meters: Converts yards to meters
    - auto_convert_hole_distances: Trigger function to automatically handle conversions

  2. Changes
    - Add trigger on course_holes table to auto-convert distances
*/

-- Create function to convert meters to yards
CREATE OR REPLACE FUNCTION convert_distance_meters_to_yards(meters integer)
RETURNS integer AS $$
BEGIN
  IF meters IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN ROUND(meters * 1.0936);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to convert yards to meters
CREATE OR REPLACE FUNCTION convert_distance_yards_to_meters(yards integer)
RETURNS integer AS $$
BEGIN
  IF yards IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN ROUND(yards * 0.9144);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create trigger function to handle automatic conversions
CREATE OR REPLACE FUNCTION auto_convert_hole_distances()
RETURNS TRIGGER AS $$
BEGIN
  -- If meters values are provided, calculate yards
  IF NEW.distance_black_meters IS NOT NULL THEN
    NEW.distance_black_yards := convert_distance_meters_to_yards(NEW.distance_black_meters);
  END IF;
  IF NEW.distance_white_meters IS NOT NULL THEN
    NEW.distance_white_yards := convert_distance_meters_to_yards(NEW.distance_white_meters);
  END IF;
  IF NEW.distance_yellow_meters IS NOT NULL THEN
    NEW.distance_yellow_yards := convert_distance_meters_to_yards(NEW.distance_yellow_meters);
  END IF;
  IF NEW.distance_blue_meters IS NOT NULL THEN
    NEW.distance_blue_yards := convert_distance_meters_to_yards(NEW.distance_blue_meters);
  END IF;
  IF NEW.distance_red_meters IS NOT NULL THEN
    NEW.distance_red_yards := convert_distance_meters_to_yards(NEW.distance_red_meters);
  END IF;

  -- If yards values are provided but meters are null, calculate meters
  IF NEW.distance_black_yards IS NOT NULL AND NEW.distance_black_meters IS NULL THEN
    NEW.distance_black_meters := convert_distance_yards_to_meters(NEW.distance_black_yards);
  END IF;
  IF NEW.distance_white_yards IS NOT NULL AND NEW.distance_white_meters IS NULL THEN
    NEW.distance_white_meters := convert_distance_yards_to_meters(NEW.distance_white_yards);
  END IF;
  IF NEW.distance_yellow_yards IS NOT NULL AND NEW.distance_yellow_meters IS NULL THEN
    NEW.distance_yellow_meters := convert_distance_yards_to_meters(NEW.distance_yellow_yards);
  END IF;
  IF NEW.distance_blue_yards IS NOT NULL AND NEW.distance_blue_meters IS NULL THEN
    NEW.distance_blue_meters := convert_distance_yards_to_meters(NEW.distance_blue_yards);
  END IF;
  IF NEW.distance_red_yards IS NOT NULL AND NEW.distance_red_meters IS NULL THEN
    NEW.distance_red_meters := convert_distance_yards_to_meters(NEW.distance_red_yards);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on course_holes table
DROP TRIGGER IF EXISTS convert_distances_trigger ON course_holes;
CREATE TRIGGER convert_distances_trigger
  BEFORE INSERT OR UPDATE ON course_holes
  FOR EACH ROW
  EXECUTE FUNCTION auto_convert_hole_distances();