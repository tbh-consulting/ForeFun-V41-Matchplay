-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view scorecards" ON scorecards;
DROP POLICY IF EXISTS "Users can view scorecard players" ON scorecard_players;
DROP POLICY IF EXISTS "Users can view scores" ON scorecard_scores;
DROP POLICY IF EXISTS "Users can create scorecards" ON scorecards;
DROP POLICY IF EXISTS "Users can insert scorecard players" ON scorecard_players;

-- Scorecard policies
CREATE POLICY "Anyone can view scorecards"
  ON scorecards FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create scorecards"
  ON scorecards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own scorecards"
  ON scorecards FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- Scorecard players policies
CREATE POLICY "Anyone can view scorecard players"
  ON scorecard_players FOR SELECT
  USING (true);

CREATE POLICY "Scorecard creator can add players"
  ON scorecard_players FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM scorecards
      WHERE id = scorecard_id
      AND created_by = auth.uid()
    )
  );

-- Scorecard scores policies
CREATE POLICY "Anyone can view scores"
  ON scorecard_scores FOR SELECT
  USING (true);

CREATE POLICY "Players can add their own scores"
  ON scorecard_scores FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Players can update their own scores"
  ON scorecard_scores FOR UPDATE
  TO authenticated
  USING (auth.uid() = player_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scorecards_created_by ON scorecards(created_by);
CREATE INDEX IF NOT EXISTS idx_scorecard_players_scorecard_id ON scorecard_players(scorecard_id);
CREATE INDEX IF NOT EXISTS idx_scorecard_scores_player_id ON scorecard_scores(player_id);