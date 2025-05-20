-- Drop existing policies
DROP POLICY IF EXISTS "Users can view scorecards they're involved with" ON scorecards;
DROP POLICY IF EXISTS "Users can view players for their scorecards" ON scorecard_players;
DROP POLICY IF EXISTS "Users can view scores for their scorecards" ON scorecard_scores;
DROP POLICY IF EXISTS "Players and creators can manage scores" ON scorecard_scores;

-- Create creator-only policies for scorecards
CREATE POLICY "Creator can manage scorecards"
  ON scorecards FOR ALL
  USING (created_by = auth.uid());

-- Create creator-only policies for scorecard players
CREATE POLICY "Creator can manage scorecard players"
  ON scorecard_players FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM scorecards
      WHERE id = scorecard_id
      AND created_by = auth.uid()
    )
  );

-- Create creator-only policies for scores
CREATE POLICY "Creator can manage scores"
  ON scorecard_scores FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM scorecards
      WHERE id = scorecard_id
      AND created_by = auth.uid()
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scorecards_creator 
  ON scorecards(created_by);

CREATE INDEX IF NOT EXISTS idx_scorecard_players_scorecard 
  ON scorecard_players(scorecard_id);

CREATE INDEX IF NOT EXISTS idx_scorecard_scores_scorecard 
  ON scorecard_scores(scorecard_id);