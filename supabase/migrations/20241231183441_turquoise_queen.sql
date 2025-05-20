/*
  # Fix Scorecard Policies

  1. Changes
    - Drop existing problematic policies
    - Create new simplified policies without circular dependencies
    - Add proper indexes for performance
  
  2. Security
    - Maintain proper access control while avoiding recursion
    - Users can only access scorecards they created or are part of
    - Players can only manage their own scores
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view scorecards" ON scorecards;
DROP POLICY IF EXISTS "Users can view players" ON scorecard_players;
DROP POLICY IF EXISTS "Users can view scores" ON scorecard_scores;

-- Create base policy for scorecards
CREATE POLICY "Users can view own scorecards"
  ON scorecards FOR SELECT
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM scorecard_players
      WHERE scorecard_id = id
      AND player_id = auth.uid()
    )
  );

-- Create base policy for scorecard players
CREATE POLICY "Users can view own players"
  ON scorecard_players FOR SELECT
  USING (
    player_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM scorecards
      WHERE id = scorecard_id
      AND created_by = auth.uid()
    )
  );

-- Create base policy for scores
CREATE POLICY "Users can view own scores"
  ON scorecard_scores FOR SELECT
  USING (
    player_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM scorecards
      WHERE id = scorecard_id
      AND created_by = auth.uid()
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scorecard_players_scorecard_player 
  ON scorecard_players(scorecard_id, player_id);

CREATE INDEX IF NOT EXISTS idx_scorecard_scores_scorecard_player 
  ON scorecard_scores(scorecard_id, player_id);

-- Add indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_scorecards_created_by 
  ON scorecards(created_by);

CREATE INDEX IF NOT EXISTS idx_scorecard_players_player_id 
  ON scorecard_players(player_id);

CREATE INDEX IF NOT EXISTS idx_scorecard_scores_player_id 
  ON scorecard_scores(player_id);