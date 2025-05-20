-- First drop all existing policies
DROP POLICY IF EXISTS "Users can view and manage scorecards" ON scorecards;
DROP POLICY IF EXISTS "Users can view and manage scorecard players" ON scorecard_players;
DROP POLICY IF EXISTS "Users can view and manage scores" ON scorecard_scores;
DROP POLICY IF EXISTS "Players can manage their own scores" ON scorecard_scores;
DROP POLICY IF EXISTS "Creators can manage all scores" ON scorecard_scores;
DROP POLICY IF EXISTS "Users can view scores" ON scorecard_scores;
DROP POLICY IF EXISTS "Users can view scorecards" ON scorecards;
DROP POLICY IF EXISTS "Creators can manage scorecards" ON scorecards;
DROP POLICY IF EXISTS "Users can view scorecard players" ON scorecard_players;
DROP POLICY IF EXISTS "Creators can manage scorecard players" ON scorecard_players;

-- Create base policies for viewing
CREATE POLICY "view_scorecards"
  ON scorecards FOR SELECT
  USING (
    created_by = auth.uid() OR
    id IN (
      SELECT scorecard_id 
      FROM scorecard_players 
      WHERE player_id = auth.uid()
    )
  );

CREATE POLICY "view_scorecard_players"
  ON scorecard_players FOR SELECT
  USING (
    player_id = auth.uid() OR
    scorecard_id IN (
      SELECT id 
      FROM scorecards 
      WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "view_scores"
  ON scorecard_scores FOR SELECT
  USING (
    player_id = auth.uid() OR
    scorecard_id IN (
      SELECT id 
      FROM scorecards 
      WHERE created_by = auth.uid()
    )
  );

-- Create policies for managing data
CREATE POLICY "manage_scorecards"
  ON scorecards 
  FOR ALL 
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "manage_scorecard_players"
  ON scorecard_players
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM scorecards 
      WHERE id = scorecard_id 
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "manage_own_scores"
  ON scorecard_scores
  FOR UPDATE
  USING (
    player_id = auth.uid() AND
    NOT EXISTS (
      SELECT 1 
      FROM scorecards 
      WHERE id = scorecard_id 
      AND completed_at IS NOT NULL
    )
  );

CREATE POLICY "manage_all_scores"
  ON scorecard_scores
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 
      FROM scorecards 
      WHERE id = scorecard_id 
      AND created_by = auth.uid()
      AND completed_at IS NULL
    )
  );

-- Add optimized indexes
CREATE INDEX IF NOT EXISTS idx_scorecards_created_by 
  ON scorecards(created_by);

CREATE INDEX IF NOT EXISTS idx_scorecard_players_player_scorecard 
  ON scorecard_players(player_id, scorecard_id);

CREATE INDEX IF NOT EXISTS idx_scorecard_scores_player_scorecard 
  ON scorecard_scores(player_id, scorecard_id);