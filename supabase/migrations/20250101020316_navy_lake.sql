-- Drop existing problematic policies
DROP POLICY IF EXISTS "Anyone can view scorecards" ON scorecards;
DROP POLICY IF EXISTS "Anyone can view scores" ON scorecard_scores;
DROP POLICY IF EXISTS "Anyone can view scorecard players" ON scorecard_players;

-- Create new restrictive policies for scorecards
CREATE POLICY "Users can only view their own scorecards"
  ON scorecards FOR SELECT
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM scorecard_players
      WHERE scorecard_id = id
      AND player_id = auth.uid()
    )
  );

-- Create new restrictive policies for scorecard players
CREATE POLICY "Users can only view players for their scorecards"
  ON scorecard_players FOR SELECT
  USING (
    player_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM scorecards
      WHERE id = scorecard_id
      AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM scorecard_players sp
          WHERE sp.scorecard_id = id
          AND sp.player_id = auth.uid()
        )
      )
    )
  );

-- Create new restrictive policies for scores
CREATE POLICY "Users can only view scores for their scorecards"
  ON scorecard_scores FOR SELECT
  USING (
    player_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM scorecards
      WHERE id = scorecard_id
      AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM scorecard_players sp
          WHERE sp.scorecard_id = id
          AND sp.player_id = auth.uid()
        )
      )
    )
  );

-- Add indexes to improve policy performance
CREATE INDEX IF NOT EXISTS idx_scorecards_created_by ON scorecards(created_by);
CREATE INDEX IF NOT EXISTS idx_scorecard_players_player_id ON scorecard_players(player_id);
CREATE INDEX IF NOT EXISTS idx_scorecard_scores_player_id ON scorecard_scores(player_id);