-- Remove existing foreign key constraints
ALTER TABLE activities
DROP CONSTRAINT IF EXISTS activities_scorecard_id_fkey,
DROP CONSTRAINT IF EXISTS activities_course_id_fkey;

-- Add new foreign key constraints with ON DELETE SET NULL
ALTER TABLE activities
ADD CONSTRAINT activities_scorecard_id_fkey 
  FOREIGN KEY (scorecard_id) 
  REFERENCES scorecards(id)
  ON DELETE SET NULL,
ADD CONSTRAINT activities_course_id_fkey 
  FOREIGN KEY (course_id) 
  REFERENCES courses(id)
  ON DELETE SET NULL;

-- Add indexes for better join performance
CREATE INDEX IF NOT EXISTS idx_activities_scorecard_id ON activities(scorecard_id) WHERE scorecard_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activities_course_id ON activities(course_id) WHERE course_id IS NOT NULL;