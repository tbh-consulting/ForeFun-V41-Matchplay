-- Drop and recreate course creation policy with proper auth checks
DROP POLICY IF EXISTS "Authenticated users can create courses" ON courses;
CREATE POLICY "Authenticated users can create courses"
  ON courses FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    created_by = auth.uid()
  );

-- Add function to handle course creation with auth.uid()
CREATE OR REPLACE FUNCTION create_course(
  p_name text,
  p_address text,
  p_country text,
  p_description text,
  p_holes integer,
  p_dog_policy dog_policy DEFAULT 'na',
  p_image_url text DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  v_course_id uuid;
BEGIN
  -- Validate input
  IF p_holes NOT IN (9, 18) THEN
    RAISE EXCEPTION 'Number of holes must be either 9 or 18';
  END IF;

  -- Insert course using auth.uid() as created_by
  INSERT INTO courses (
    name,
    address,
    country,
    description,
    holes,
    dog_policy,
    image_url,
    created_by
  ) VALUES (
    p_name,
    p_address,
    p_country,
    p_description,
    p_holes,
    p_dog_policy,
    p_image_url,
    auth.uid()
  ) RETURNING id INTO v_course_id;

  RETURN v_course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_course TO authenticated;

-- Ensure all required columns have appropriate constraints
ALTER TABLE courses ALTER COLUMN name SET NOT NULL;
ALTER TABLE courses ALTER COLUMN address SET NOT NULL;
ALTER TABLE courses ALTER COLUMN country SET NOT NULL;
ALTER TABLE courses ALTER COLUMN holes SET NOT NULL;
ALTER TABLE courses ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE courses ALTER COLUMN dog_policy SET NOT NULL;
ALTER TABLE courses ALTER COLUMN dog_policy SET DEFAULT 'na';

-- Add helpful indexes
CREATE INDEX IF NOT EXISTS idx_courses_created_by ON courses(created_by);
CREATE INDEX IF NOT EXISTS idx_courses_name_search ON courses(name);