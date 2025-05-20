-- Drop indexes
DROP INDEX IF EXISTS idx_scorecard_players_composite;
DROP INDEX IF EXISTS idx_scorecard_scores_composite;

-- Drop existing policies
DROP POLICY IF EXISTS "Players can access scorecards" ON scorecards;
DROP POLICY IF EXISTS "Players can access scorecard players" ON scorecard_players;
DROP POLICY IF EXISTS "Players can manage scores" ON scorecard_scores;

-- Restore original policies
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