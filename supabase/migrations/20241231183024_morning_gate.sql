-- Drop existing policies
DROP POLICY IF EXISTS "Users can view scorecards they're part of" ON scorecards;
DROP POLICY IF EXISTS "Users can view scorecard players they're part of" ON scorecard_players;
DROP POLICY IF EXISTS "Users can view scores for scorecards they're part of" ON scorecard_scores;

-- Create new, simplified policies for scorecards
CREATE POLICY "Users can view their own scorecards"
  ON scorecards FOR SELECT
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM scorecard_players
      WHERE scorecard_id = id
      AND player_id = auth.uid()
    )
  );

-- Update scorecard players policies
CREATE POLICY "Users can view scorecard players"
  ON scorecard_players FOR SELECT
  USING (
    player_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM scorecards
      WHERE id = scorecard_id
      AND created_by = auth.uid()
    )
  );

-- Update scorecard scores policies
CREATE POLICY "Users can view scorecard scores"
  ON scorecard_scores FOR SELECT
  USING (
    player_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM scorecards
      WHERE id = scorecard_id
      AND created_by = auth.uid()
    )
  );

-- Add indexes to improve policy performance
CREATE INDEX IF NOT EXISTS idx_scorecards_created_by ON scorecards(created_by);
CREATE INDEX IF NOT EXISTS idx_scorecard_players_player_id ON scorecard_players(player_id);
CREATE INDEX IF NOT EXISTS idx_scorecard_scores_player_id ON scorecard_scores(player_id);