-- Drop existing policies
DROP POLICY IF EXISTS "Users can view and manage scorecards" ON scorecards;
DROP POLICY IF EXISTS "Users can view and manage scorecard players" ON scorecard_players;
DROP POLICY IF EXISTS "Users can view and manage scores" ON scorecard_scores;

-- Create base policy for scorecards
CREATE POLICY "Users can view and manage scorecards"
  ON scorecards FOR ALL
  USING (
    created_by = auth.uid() OR
    id IN (
      SELECT scorecard_id 
      FROM scorecard_players 
      WHERE player_id = auth.uid()
    )
  );

-- Create base policy for scorecard players
CREATE POLICY "Users can view and manage scorecard players"
  ON scorecard_players FOR ALL
  USING (
    player_id = auth.uid() OR
    scorecard_id IN (
      SELECT id 
      FROM scorecards 
      WHERE created_by = auth.uid()
    )
  );

-- Create base policy for scores
CREATE POLICY "Users can view and manage scores"
  ON scorecard_scores FOR ALL
  USING (
    player_id = auth.uid() OR
    scorecard_id IN (
      SELECT id 
      FROM scorecards 
      WHERE created_by = auth.uid()
    )
  );

-- Add optimized indexes
CREATE INDEX IF NOT EXISTS idx_scorecards_created_by 
  ON scorecards(created_by);

CREATE INDEX IF NOT EXISTS idx_scorecard_players_player_scorecard 
  ON scorecard_players(player_id, scorecard_id);

CREATE INDEX IF NOT EXISTS idx_scorecard_scores_player_scorecard 
  ON scorecard_scores(player_id, scorecard_id);