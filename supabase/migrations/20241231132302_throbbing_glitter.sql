/*
  # Update course holes schema to support both yards and meters

  1. Changes
    - Add new columns for meters distances
    - Make handicap optional
    - Remove unique constraint on handicap
    - Add check constraints for valid distances

  2. Data Migration
    - No data migration needed as these are new columns
*/

-- Remove unique constraint on handicap
ALTER TABLE course_holes
DROP CONSTRAINT IF EXISTS course_holes_course_id_handicap_key;

-- Make handicap optional
ALTER TABLE course_holes
ALTER COLUMN handicap DROP NOT NULL;

-- Add meter distance columns
ALTER TABLE course_holes
ADD COLUMN distance_black_meters integer,
ADD COLUMN distance_white_meters integer,
ADD COLUMN distance_yellow_meters integer,
ADD COLUMN distance_blue_meters integer,
ADD COLUMN distance_red_meters integer;

-- Rename existing distance columns to clarify they are yards
ALTER TABLE course_holes
RENAME COLUMN distance_black TO distance_black_yards;

ALTER TABLE course_holes
RENAME COLUMN distance_white TO distance_white_yards;

ALTER TABLE course_holes
RENAME COLUMN distance_yellow TO distance_yellow_yards;

ALTER TABLE course_holes
RENAME COLUMN distance_blue TO distance_blue_yards;

ALTER TABLE course_holes
RENAME COLUMN distance_red TO distance_red_yards;

-- Add check constraints for valid distances
ALTER TABLE course_holes
ADD CONSTRAINT valid_yards_distances
CHECK (
  (distance_black_yards IS NULL OR distance_black_yards > 0) AND
  (distance_white_yards IS NULL OR distance_white_yards > 0) AND
  (distance_yellow_yards IS NULL OR distance_yellow_yards > 0) AND
  (distance_blue_yards IS NULL OR distance_blue_yards > 0) AND
  (distance_red_yards IS NULL OR distance_red_yards > 0)
);

ALTER TABLE course_holes
ADD CONSTRAINT valid_meters_distances
CHECK (
  (distance_black_meters IS NULL OR distance_black_meters > 0) AND
  (distance_white_meters IS NULL OR distance_white_meters > 0) AND
  (distance_yellow_meters IS NULL OR distance_yellow_meters > 0) AND
  (distance_blue_meters IS NULL OR distance_blue_meters > 0) AND
  (distance_red_meters IS NULL OR distance_red_meters > 0)
);