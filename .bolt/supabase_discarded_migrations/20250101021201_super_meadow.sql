-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view and manage their scorecards" ON scorecards;
DROP POLICY IF EXISTS "Creator can modify scorecards" ON scorecards;
DROP POLICY IF EXISTS "Creator can delete scorecards" ON scorecards;
DROP POLICY IF EXISTS "Users can view scorecard players" ON scorecard_players;
DROP POLICY IF EXISTS "Creator can manage players" ON scorecard_players;
DROP POLICY IF EXISTS "Users can view scores" ON scorecard_scores;
DROP POLICY IF EXISTS "Players and creators can manage scores" ON scorecard_scores;

-- Create comprehensive policies for scorecards
CREATE POLICY "Users can view their scorecards"
  ON scorecards
  FOR SELECT
  USING (
    created_by = auth.uid() OR  -- Creator can view
    id IN (                     -- Players can view
      SELECT scorecard_id 
      FROM scorecard_players 
      WHERE player_id = auth.uid()
    )
  );

CREATE POLICY "Creator can insert scorecards"
  ON scorecards
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creator can update scorecards"
  ON scorecards
  FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Creator can delete scorecards"
  ON scorecards
  FOR DELETE
  USING (auth.uid() = created_by);

-- Create policies for scorecard players
CREATE POLICY "Users can view scorecard players"
  ON scorecard_players
  FOR SELECT
  USING (
    player_id = auth.uid() OR                  -- Can see own player record
    EXISTS (                                   -- Can see players in scorecards they created
      SELECT 1 FROM scorecards
      WHERE id = scorecard_id
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Creator can manage players"
  ON scorecard_players
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM scorecards
      WHERE id = scorecard_id
      AND created_by = auth.uid()
    )
  );

-- Create policies for scorecard scores
CREATE POLICY "Users can view scores"
  ON scorecard_scores
  FOR SELECT
  USING (
    player_id = auth.uid() OR                  -- Can see own scores
    EXISTS (                                   -- Can see scores in scorecards they created
      SELECT 1 FROM scorecards
      WHERE id = scorecard_id
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Players and creators can manage scores"
  ON scorecard_scores
  FOR ALL
  USING (
    player_id = auth.uid() OR                  -- Players can manage their scores
    EXISTS (                                   -- Creators can manage all scores
      SELECT 1 FROM scorecards
      WHERE id = scorecard_id
      AND created_by = auth.uid()
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scorecards_created_by ON scorecards(created_by);
CREATE INDEX IF NOT EXISTS idx_scorecard_players_scorecard_player ON scorecard_players(scorecard_id, player_id);
CREATE INDEX IF NOT EXISTS idx_scorecard_scores_scorecard_player ON scorecard_scores(scorecard_id, player_id);