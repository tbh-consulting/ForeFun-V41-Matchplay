-- Add optional scorecard_id column to activities table
ALTER TABLE activities
ADD COLUMN scorecard_id uuid REFERENCES scorecards(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_activities_scorecard_id ON activities(scorecard_id);

-- Update existing activities with scorecard_id
UPDATE activities
SET scorecard_id = (data->>'scorecardId')::uuid
WHERE type = 'scorecard_created'
AND data->>'scorecardId' IS NOT NULL;

-- Update scorecard creation trigger to use new column
CREATE OR REPLACE FUNCTION handle_scorecard_created()
RETURNS TRIGGER AS $$
DECLARE
  v_course_name text;
BEGIN
  SELECT name INTO v_course_name
  FROM courses
  WHERE id = NEW.course_id;

  INSERT INTO activities (user_id, type, data, scorecard_id)
  VALUES (
    NEW.created_by,
    'scorecard_created',
    jsonb_build_object(
      'courseId', NEW.course_id,
      'courseName', v_course_name,
      'scorecardId', NEW.id
    ),
    NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;