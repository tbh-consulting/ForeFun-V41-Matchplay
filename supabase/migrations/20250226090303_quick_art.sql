-- Add completed_holes column to scorecard_players
ALTER TABLE scorecard_players
ADD COLUMN completed_holes integer DEFAULT 0;

-- Create index for better performance
CREATE INDEX idx_scorecard_players_completed_holes 
ON scorecard_players(completed_holes);

-- Create function to calculate completed holes
CREATE OR REPLACE FUNCTION calculate_completed_holes()
RETURNS TRIGGER AS $$
BEGIN
  -- Update completed_holes for the affected player
  UPDATE scorecard_players sp
  SET completed_holes = (
    SELECT COUNT(*)
    FROM scorecard_scores ss
    WHERE ss.scorecard_id = sp.scorecard_id
    AND ss.player_id = sp.player_id
    AND ss.gross_score IS NOT NULL
  )
  WHERE scorecard_id = NEW.scorecard_id
  AND player_id = NEW.player_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update completed_holes when scores change
CREATE TRIGGER update_completed_holes
AFTER INSERT OR UPDATE OF gross_score OR DELETE
ON scorecard_scores
FOR EACH ROW
EXECUTE FUNCTION calculate_completed_holes();

-- Initialize completed_holes for existing records
UPDATE scorecard_players sp
SET completed_holes = (
  SELECT COUNT(*)
  FROM scorecard_scores ss
  WHERE ss.scorecard_id = sp.scorecard_id
  AND ss.player_id = sp.player_id
  AND ss.gross_score IS NOT NULL
);