-- Remove the ON DELETE CASCADE constraint from scorecard_id
ALTER TABLE activities
DROP CONSTRAINT IF EXISTS activities_scorecard_id_fkey,
ADD CONSTRAINT activities_scorecard_id_fkey 
  FOREIGN KEY (scorecard_id) 
  REFERENCES scorecards(id) 
  ON DELETE SET NULL; -- Set to NULL instead of CASCADE

-- This allows us to keep activity history even when scorecards are deleted
-- The activity will remain but its scorecard_id will be set to NULL