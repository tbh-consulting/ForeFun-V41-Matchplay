-- Drop all existing policies
DROP POLICY IF EXISTS "view_scorecards" ON scorecards;
DROP POLICY IF EXISTS "view_scorecard_players" ON scorecard_players;
DROP POLICY IF EXISTS "view_scores" ON scorecard_scores;
DROP POLICY IF EXISTS "manage_scorecards" ON scorecards;
DROP POLICY IF EXISTS "manage_scorecard_players" ON scorecard_players;
DROP POLICY IF EXISTS "manage_own_scores" ON scorecard_scores;
DROP POLICY IF EXISTS "manage_all_scores" ON scorecard_scores;

-- Restore original policies for scorecards
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

CREATE POLICY "Creator can manage scorecards"
  ON scorecards FOR ALL
  USING (created_by = auth.uid());

-- Restore original policies for scorecard players
CREATE POLICY "Users can view scorecard players"
  ON scorecard_players FOR SELECT
  USING (
    player_id = auth.uid() OR
    scorecard_id IN (
      SELECT id 
      FROM scorecards 
      WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Creator can manage scorecard players"
  ON scorecard_players FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM scorecards
      WHERE id = scorecard_id
      AND created_by = auth.uid()
    )
  );

-- Restore original policies for scorecard scores
CREATE POLICY "Users can view scores"
  ON scorecard_scores FOR SELECT
  USING (
    player_id = auth.uid() OR
    scorecard_id IN (
      SELECT id 
      FROM scorecards 
      WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Players and creators can manage scores"
  ON scorecard_scores 
  USING (
    player_id = auth.uid() OR
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