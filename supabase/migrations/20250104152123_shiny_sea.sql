-- Drop the scorecard deletion trigger and function since we want to keep activity history
DROP TRIGGER IF EXISTS on_scorecard_deleted ON scorecards;
DROP FUNCTION IF EXISTS handle_scorecard_deleted();

-- The scorecard_id column with ON DELETE CASCADE will still handle orphaned activities
-- if we decide to implement that in the future, but for now we'll keep all activities
-- for historical purposes