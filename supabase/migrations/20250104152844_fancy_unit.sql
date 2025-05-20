-- Remove all foreign key constraints from activities table
ALTER TABLE activities
DROP CONSTRAINT IF EXISTS activities_scorecard_id_fkey,
DROP CONSTRAINT IF EXISTS activities_course_id_fkey;

-- Drop any existing indexes
DROP INDEX IF EXISTS idx_activities_scorecard_id;
DROP INDEX IF EXISTS idx_activities_course_id;

-- Drop the columns entirely since we don't want any references
ALTER TABLE activities
DROP COLUMN IF EXISTS scorecard_id,
DROP COLUMN IF EXISTS course_id;