-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view scorecards they're involved with" ON scorecards;
DROP POLICY IF EXISTS "Creator can manage scorecards" ON scorecards;
DROP POLICY IF EXISTS "Users can view scorecard players" ON scorecard_players;
DROP POLICY IF EXISTS "Creator can manage scorecard players" ON scorecard_players;
DROP POLICY IF EXISTS "Users can view scores" ON scorecard_scores;
DROP POLICY IF EXISTS "Players and creators can manage scores" ON scorecard_scores;

-- Create view-only policies for players
CREATE POLICY "Players can view scorecards"
  ON scorecards FOR SELECT
  USING (
    id IN (
      SELECT scorecard_id 
      FROM scorecard_players 
      WHERE player_id = auth.uid()
    )
  );

CREATE POLICY "Players can view scorecard players"
  ON scorecard_players FOR SELECT
  USING (
    player_id = auth.uid()
  );

CREATE POLICY "Players can view scores"
  ON scorecard_scores FOR SELECT
  USING (
    player_id = auth.uid()
  );

-- Create full management policies for creators
CREATE POLICY "Creators can manage scorecards"
  ON scorecards 
  FOR ALL
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Creators can manage scorecard players"
  ON scorecard_players
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM scorecards
      WHERE id = scorecard_id
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Creators can manage scores"
  ON scorecard_scores
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM scorecards
      WHERE id = scorecard_id
      AND created_by = auth.uid()
    )
  );

-- Keep the optimized indexes
CREATE INDEX IF NOT EXISTS idx_scorecards_created_by 
  ON scorecards(created_by);

CREATE INDEX IF NOT EXISTS idx_scorecard_players_player_scorecard 
  ON scorecard_players(player_id, scorecard_id);

CREATE INDEX IF NOT EXISTS idx_scorecard_scores_player_scorecard 
  ON scorecard_scores(player_id, scorecard_id);