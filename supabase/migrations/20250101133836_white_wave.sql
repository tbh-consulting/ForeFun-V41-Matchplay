-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can update their own courses" ON courses;

-- Create new policy allowing any authenticated user to update courses
CREATE POLICY "Authenticated users can update courses"
  ON courses FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy for deletion (optional, let me know if you want this too)
CREATE POLICY "Authenticated users can delete courses"
  ON courses FOR DELETE
  TO authenticated
  USING (true);

-- Update course holes policy to match
DROP POLICY IF EXISTS "Authenticated users can manage course holes" ON course_holes;
CREATE POLICY "Authenticated users can manage course holes"
  ON course_holes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Update course reviews policy to match
DROP POLICY IF EXISTS "Users can update their own reviews" ON course_reviews;
CREATE POLICY "Authenticated users can manage reviews"
  ON course_reviews FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);