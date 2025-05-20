-- Drop existing policies
DROP POLICY IF EXISTS "Creator can manage scorecards" ON scorecards;
DROP POLICY IF EXISTS "Creator can manage scorecard players" ON scorecard_players;
DROP POLICY IF EXISTS "Creator can manage scores" ON scorecard_scores;

-- Create updated policies for scorecards
CREATE POLICY "Users can view and manage scorecards"
  ON scorecards FOR ALL
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM scorecard_players
      WHERE scorecard_id = id
      AND player_id = auth.uid()
    )
  );

-- Create updated policies for scorecard players
CREATE POLICY "Users can view and manage scorecard players"
  ON scorecard_players FOR ALL
  USING (
    player_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM scorecards
      WHERE id = scorecard_id
      AND created_by = auth.uid()
    )
  );

-- Create updated policies for scorecard scores
CREATE POLICY "Users can view and manage scores"
  ON scorecard_scores FOR ALL
  USING (
    player_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM scorecards
      WHERE id = scorecard_id
      AND created_by = auth.uid()
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scorecard_players_player_id_scorecard_id 
  ON scorecard_players(player_id, scorecard_id);

CREATE INDEX IF NOT EXISTS idx_scorecard_scores_player_id_scorecard_id 
  ON scorecard_scores(player_id, scorecard_id);