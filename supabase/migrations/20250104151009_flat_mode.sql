-- Create function to handle scorecard deletion
CREATE OR REPLACE FUNCTION handle_scorecard_deleted()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete activities referencing this scorecard
  DELETE FROM activities
  WHERE type = 'scorecard_created'
  AND (data->>'scorecardId')::uuid = OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for scorecard deletion
CREATE TRIGGER on_scorecard_deleted
  BEFORE DELETE ON scorecards
  FOR EACH ROW
  EXECUTE FUNCTION handle_scorecard_deleted();