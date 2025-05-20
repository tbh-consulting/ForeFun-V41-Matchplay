-- Add relative_score column to scorecard_players
ALTER TABLE scorecard_players
ADD COLUMN relative_score integer DEFAULT 0;

-- Create index for better performance
CREATE INDEX idx_scorecard_players_relative_score 
ON scorecard_players(relative_score);

-- Create function to calculate relative score
CREATE OR REPLACE FUNCTION calculate_relative_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Update relative score for the affected player
  UPDATE scorecard_players sp
  SET relative_score = (
    SELECT COALESCE(SUM(gross_score - hole_par), 0)
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

-- Create trigger to update relative score when scores change
CREATE TRIGGER update_relative_score
AFTER INSERT OR UPDATE OF gross_score OR DELETE
ON scorecard_scores
FOR EACH ROW
EXECUTE FUNCTION calculate_relative_score();

-- Initialize existing relative scores
UPDATE scorecard_players sp
SET relative_score = (
  SELECT COALESCE(SUM(gross_score - hole_par), 0)
  FROM scorecard_scores ss
  WHERE ss.scorecard_id = sp.scorecard_id
  AND ss.player_id = sp.player_id
  AND ss.gross_score IS NOT NULL
);