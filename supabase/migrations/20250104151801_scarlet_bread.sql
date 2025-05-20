-- Drop existing trigger and function since we don't need them anymore
DROP TRIGGER IF EXISTS on_scorecard_deleted ON scorecards;
DROP FUNCTION IF EXISTS handle_scorecard_deleted();

-- The scorecard_id column with ON DELETE CASCADE will automatically
-- handle the deletion of related activities when a scorecard is deleted,
-- so we don't need a separate trigger anymore.

-- Add index to improve join performance between activities and scorecards
CREATE INDEX IF NOT EXISTS idx_activities_scorecard_type 
ON activities(scorecard_id, type) 
WHERE scorecard_id IS NOT NULL;