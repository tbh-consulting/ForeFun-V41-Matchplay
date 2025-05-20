-- Allow null values for all distance columns
ALTER TABLE course_holes
ALTER COLUMN distance_black_meters DROP NOT NULL,
ALTER COLUMN distance_white_meters DROP NOT NULL,
ALTER COLUMN distance_yellow_meters DROP NOT NULL,
ALTER COLUMN distance_blue_meters DROP NOT NULL,
ALTER COLUMN distance_red_meters DROP NOT NULL,
ALTER COLUMN distance_black_yards DROP NOT NULL,
ALTER COLUMN distance_white_yards DROP NOT NULL,
ALTER COLUMN distance_yellow_yards DROP NOT NULL,
ALTER COLUMN distance_blue_yards DROP NOT NULL,
ALTER COLUMN distance_red_yards DROP NOT NULL;

-- Update check constraints to allow null values
ALTER TABLE course_holes
DROP CONSTRAINT IF EXISTS valid_yards_distances,
DROP CONSTRAINT IF EXISTS valid_meters_distances,
ADD CONSTRAINT valid_yards_distances
  CHECK (
    distance_black_yards IS NULL OR distance_black_yards > 0 AND
    distance_white_yards IS NULL OR distance_white_yards > 0 AND
    distance_yellow_yards IS NULL OR distance_yellow_yards > 0 AND
    distance_blue_yards IS NULL OR distance_blue_yards > 0 AND
    distance_red_yards IS NULL OR distance_red_yards > 0
  ),
ADD CONSTRAINT valid_meters_distances
  CHECK (
    distance_black_meters IS NULL OR distance_black_meters > 0 AND
    distance_white_meters IS NULL OR distance_white_meters > 0 AND
    distance_yellow_meters IS NULL OR distance_yellow_meters > 0 AND
    distance_blue_meters IS NULL OR distance_blue_meters > 0 AND
    distance_red_meters IS NULL OR distance_red_meters > 0
  );