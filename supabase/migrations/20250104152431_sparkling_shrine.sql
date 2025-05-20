-- Remove the ON DELETE CASCADE constraint from activities table
ALTER TABLE activities
DROP CONSTRAINT IF EXISTS activities_scorecard_id_fkey,
ADD CONSTRAINT activities_scorecard_id_fkey 
  FOREIGN KEY (scorecard_id) 
  REFERENCES scorecards(id);

-- Remove the ON DELETE CASCADE constraint from activities table for courses
ALTER TABLE activities
DROP CONSTRAINT IF EXISTS activities_course_id_fkey,
ADD CONSTRAINT activities_course_id_fkey 
  FOREIGN KEY (course_id) 
  REFERENCES courses(id);