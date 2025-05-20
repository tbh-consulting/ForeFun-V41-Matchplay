-- Drop existing policies
DROP POLICY IF EXISTS "Users can only view their own scorecards" ON scorecards;
DROP POLICY IF EXISTS "Users can only view players for their scorecards" ON scorecard_players;
DROP POLICY IF EXISTS "Users can only view scores for their scorecards" ON scorecard_scores;

-- Create strict policies for scorecards
CREATE POLICY "Users can view scorecards they're involved with"
  ON scorecards FOR SELECT
  USING (
    created_by = auth.uid() OR
    id IN (
      SELECT scorecard_id 
      FROM scorecard_players 
      WHERE player_id = auth.uid()
    )
  );

-- Create strict policies for scorecard players
CREATE POLICY "Users can view players for their scorecards"
  ON scorecard_players FOR SELECT
  USING (
    player_id = auth.uid() OR
    scorecard_id IN (
      SELECT id 
      FROM scorecards 
      WHERE created_by = auth.uid()
    )
  );

-- Create strict policies for scores
CREATE POLICY "Users can view scores for their scorecards"
  ON scorecard_scores FOR SELECT
  USING (
    player_id = auth.uid() OR
    scorecard_id IN (
      SELECT id 
      FROM scorecards 
      WHERE created_by = auth.uid()
    )
  );

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_scorecard_players_scorecard_player 
  ON scorecard_players(scorecard_id, player_id);

CREATE INDEX IF NOT EXISTS idx_scorecard_scores_scorecard_player 
  ON scorecard_scores(scorecard_id, player_id);