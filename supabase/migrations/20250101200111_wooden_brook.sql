-- Drop existing policies
DROP POLICY IF EXISTS "Users can view scorecards they're involved with" ON scorecards;
DROP POLICY IF EXISTS "Users can view players for their scorecards" ON scorecard_players;
DROP POLICY IF EXISTS "Users can view scores for their scorecards" ON scorecard_scores;
DROP POLICY IF EXISTS "Players and creators can manage scores" ON scorecard_scores;

-- Create updated policies for scorecards
CREATE POLICY "Players can access scorecards"
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
CREATE POLICY "Players can access scorecard players"
  ON scorecard_players FOR ALL
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

-- Create updated policies for scorecard scores
CREATE POLICY "Players can manage scores"
  ON scorecard_scores FOR ALL
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scorecard_players_composite 
  ON scorecard_players(scorecard_id, player_id);

CREATE INDEX IF NOT EXISTS idx_scorecard_scores_composite 
  ON scorecard_scores(scorecard_id, player_id);