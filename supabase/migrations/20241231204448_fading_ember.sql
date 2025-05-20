-- Add deletion policy for scorecards
CREATE POLICY "Users can delete own scorecards"
  ON scorecards FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Add cascade delete trigger for cleanup
CREATE OR REPLACE FUNCTION cleanup_scorecard_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Clean up related records
  DELETE FROM scorecard_players WHERE scorecard_id = OLD.id;
  DELETE FROM scorecard_scores WHERE scorecard_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_scorecard_delete
  BEFORE DELETE ON scorecards
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_scorecard_data();