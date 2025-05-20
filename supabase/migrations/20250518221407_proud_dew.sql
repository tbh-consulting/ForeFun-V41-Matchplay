-- Drop existing trigger and function
DROP TRIGGER IF EXISTS before_scorecard_delete ON scorecards;
DROP FUNCTION IF EXISTS cleanup_scorecard_data();

-- Create improved function to handle scorecard data cleanup
CREATE OR REPLACE FUNCTION cleanup_scorecard_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Clean up related records using direct DELETE statements
  -- These will work even if there are no records to delete
  DELETE FROM scorecard_scores WHERE scorecard_id = OLD.id;
  DELETE FROM scorecard_players WHERE scorecard_id = OLD.id;
  DELETE FROM scorecard_team_scores WHERE scorecard_id = OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for scorecard deletion
CREATE TRIGGER before_scorecard_delete
  BEFORE DELETE ON scorecards
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_scorecard_data();