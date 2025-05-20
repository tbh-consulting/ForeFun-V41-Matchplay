-- Create function to update player stats when scorecard is completed
CREATE OR REPLACE FUNCTION update_player_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_player_id uuid;
  v_total_score integer;
  v_current_best integer;
BEGIN
  -- Only proceed if the scorecard is being marked as completed
  IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
    -- For each player in the scorecard
    FOR v_player_id IN (
      SELECT player_id FROM scorecard_players WHERE scorecard_id = NEW.id
    ) LOOP
      -- Calculate total score for this player
      SELECT SUM(gross_score)
      INTO v_total_score
      FROM scorecard_scores
      WHERE scorecard_id = NEW.id
      AND player_id = v_player_id;

      -- Get current best score
      SELECT best_score
      INTO v_current_best
      FROM profiles
      WHERE id = v_player_id;

      -- Update player stats
      UPDATE profiles
      SET 
        rounds_played = rounds_played + 1,
        best_score = CASE 
          WHEN best_score IS NULL OR v_total_score < best_score 
          THEN v_total_score 
          ELSE best_score 
        END
      WHERE id = v_player_id;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating stats
DROP TRIGGER IF EXISTS update_stats_on_completion ON scorecards;
CREATE TRIGGER update_stats_on_completion
  AFTER UPDATE ON scorecards
  FOR EACH ROW
  EXECUTE FUNCTION update_player_stats();