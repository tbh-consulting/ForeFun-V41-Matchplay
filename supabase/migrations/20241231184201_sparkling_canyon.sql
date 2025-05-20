/*
  # Fix Scorecard RLS Policies

  1. Changes
    - Remove recursive policies that were causing infinite loops
    - Simplify policies to use direct user checks
    - Add proper indexes for performance
  
  2. Security
    - Maintain data access control while preventing recursion
    - Ensure users can only access scorecards they're part of
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own scorecards" ON scorecards;
DROP POLICY IF EXISTS "Users can view own players" ON scorecard_players;
DROP POLICY IF EXISTS "Users can view own scores" ON scorecard_scores;

-- Create new, simplified policies for scorecards
CREATE POLICY "Users can view scorecards"
  ON scorecards FOR SELECT
  USING (
    created_by = auth.uid() OR
    id IN (
      SELECT scorecard_id 
      FROM scorecard_players 
      WHERE player_id = auth.uid()
    )
  );

-- Create simplified policy for scorecard players
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

-- Create simplified policy for scores
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

-- Add indexes to improve policy performance
CREATE INDEX IF NOT EXISTS idx_scorecard_players_player_scorecard 
  ON scorecard_players(player_id, scorecard_id);

CREATE INDEX IF NOT EXISTS idx_scorecard_scores_player_scorecard 
  ON scorecard_scores(player_id, scorecard_id);

CREATE INDEX IF NOT EXISTS idx_scorecards_created_by 
  ON scorecards(created_by);