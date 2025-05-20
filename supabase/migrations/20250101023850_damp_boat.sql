-- Drop and recreate courses view policy
DROP POLICY IF EXISTS "Anyone can view courses" ON courses;
CREATE POLICY "Anyone can view courses"
  ON courses FOR SELECT
  USING (true);

-- Ensure RLS is enabled
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT ON courses TO authenticated;
GRANT SELECT ON courses TO anon;