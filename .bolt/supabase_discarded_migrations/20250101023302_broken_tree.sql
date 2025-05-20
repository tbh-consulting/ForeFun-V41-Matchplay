-- Drop existing policies
DROP POLICY IF EXISTS "Users can view scorecards they're involved with" ON scorecards;
DROP POLICY IF EXISTS "Users can view players for their scorecards" ON scorecard_players;
DROP POLICY IF EXISTS "Users can view scores for their scorecards" ON scorecard_scores;

-- Create comprehensive policies for scorecards
CREATE POLICY "Users can view and manage their scorecards"
  ON scorecards
  USING (
    created_by = auth.uid() OR
    id IN (
      SELECT scorecard_id 
      FROM scorecard_players 
      WHERE player_id = auth.uid()
    )
  );

-- Allow creators to update their scorecards
CREATE POLICY "Creators can update scorecards"
  ON scorecards
  FOR UPDATE
  USING (created_by = auth.uid());

-- Allow creators to delete their scorecards
CREATE POLICY "Creators can delete scorecards"
  ON scorecards
  FOR DELETE
  USING (created_by = auth.uid());

-- Update course_holes constraints to allow NULL distances
ALTER TABLE course_holes
DROP CONSTRAINT IF EXISTS valid_meters_distances,
DROP CONSTRAINT IF EXISTS valid_yards_distances,
ADD CONSTRAINT valid_meters_distances
  CHECK (
    distance_black_meters IS NULL OR distance_black_meters > 0 AND
    distance_white_meters IS NULL OR distance_white_meters > 0 AND
    distance_yellow_meters IS NULL OR distance_yellow_meters > 0 AND
    distance_blue_meters IS NULL OR distance_blue_meters > 0 AND
    distance_red_meters IS NULL OR distance_red_meters > 0
  ),
ADD CONSTRAINT valid_yards_distances
  CHECK (
    distance_black_yards IS NULL OR distance_black_yards > 0 AND
    distance_white_yards IS NULL OR distance_white_yards > 0 AND
    distance_yellow_yards IS NULL OR distance_yellow_yards > 0 AND
    distance_blue_yards IS NULL OR distance_blue_yards > 0 AND
    distance_red_yards IS NULL OR distance_red_yards > 0
  );

-- Create comprehensive policies for scorecard players
CREATE POLICY "Users can view players in their scorecards"
  ON scorecard_players
  USING (
    player_id = auth.uid() OR
    scorecard_id IN (
      SELECT id 
      FROM scorecards 
      WHERE created_by = auth.uid()
    )
  );

-- Create comprehensive policies for scores
CREATE POLICY "Users can view and manage scores"
  ON scorecard_scores
  USING (
    player_id = auth.uid() OR
    scorecard_id IN (
      SELECT id 
      FROM scorecards 
      WHERE created_by = auth.uid()
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scorecards_created_by_id 
  ON scorecards(created_by, id);

CREATE INDEX IF NOT EXISTS idx_scorecard_players_scorecard_player_composite 
  ON scorecard_players(scorecard_id, player_id);