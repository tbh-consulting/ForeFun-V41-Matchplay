-- Add course_id column to activities table
ALTER TABLE activities
ADD COLUMN course_id uuid REFERENCES courses(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_activities_course_id ON activities(course_id);

-- Update existing activities with course_id
UPDATE activities
SET course_id = (data->>'courseId')::uuid
WHERE (type = 'course_created' OR type = 'course_reviewed')
AND data->>'courseId' IS NOT NULL;

-- Update course creation trigger to use new column
CREATE OR REPLACE FUNCTION handle_course_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activities (user_id, type, data, course_id)
  VALUES (
    NEW.created_by,
    'course_created',
    jsonb_build_object(
      'courseId', NEW.id,
      'courseName', NEW.name
    ),
    NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update course review trigger to use new column
CREATE OR REPLACE FUNCTION handle_course_reviewed()
RETURNS TRIGGER AS $$
DECLARE
  v_course_name text;
BEGIN
  SELECT name INTO v_course_name
  FROM courses
  WHERE id = NEW.course_id;

  INSERT INTO activities (user_id, type, data, course_id)
  VALUES (
    NEW.user_id,
    'course_reviewed',
    jsonb_build_object(
      'courseId', NEW.course_id,
      'courseName', v_course_name,
      'rating', NEW.rating,
      'review', NEW.comment
    ),
    NEW.course_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;