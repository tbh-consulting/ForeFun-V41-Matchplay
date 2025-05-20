-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view scorecards they're involved with" ON scorecards;
DROP POLICY IF EXISTS "Users can view players for their scorecards" ON scorecard_players;
DROP POLICY IF EXISTS "Users can view scores for their scorecards" ON scorecard_scores;

-- Create open policies for viewing scorecards
CREATE POLICY "Anyone can view scorecards"
  ON scorecards FOR SELECT
  USING (true);

-- Create open policies for viewing scorecard players
CREATE POLICY "Anyone can view scorecard players"
  ON scorecard_players FOR SELECT
  USING (true);

-- Create open policies for viewing scores
CREATE POLICY "Anyone can view scores"
  ON scorecard_scores FOR SELECT
  USING (true);

-- Keep existing policies for modifications
CREATE POLICY "Only creator can update scorecard"
  ON scorecards FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Only creator can delete scorecard"
  ON scorecards FOR DELETE
  USING (auth.uid() = created_by);

CREATE POLICY "Only creator can manage players"
  ON scorecard_players FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM scorecards
      WHERE id = scorecard_id
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Players can manage their own scores"
  ON scorecard_scores FOR ALL
  USING (
    player_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM scorecards
      WHERE id = scorecard_id
      AND created_by = auth.uid()
    )
  );