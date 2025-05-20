-- Drop existing policies
DROP POLICY IF EXISTS "Users can view scorecard players they're part of" ON scorecard_players;
DROP POLICY IF EXISTS "Creator can manage scorecard players" ON scorecard_players;

-- Create new, simplified policies
CREATE POLICY "Users can view their own scorecard players"
  ON scorecard_players FOR SELECT
  USING (
    player_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM scorecards
      WHERE id = scorecard_players.scorecard_id
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert scorecard players"
  ON scorecard_players FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM scorecards
      WHERE id = scorecard_players.scorecard_id
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update their own scorecard players"
  ON scorecard_players FOR UPDATE
  USING (
    player_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM scorecards
      WHERE id = scorecard_players.scorecard_id
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete scorecard players"
  ON scorecard_players FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM scorecards
      WHERE id = scorecard_players.scorecard_id
      AND created_by = auth.uid()
    )
  );