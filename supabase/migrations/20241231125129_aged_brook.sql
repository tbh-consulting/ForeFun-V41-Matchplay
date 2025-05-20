/*
  # Fix Course Reviews Relationship

  1. Changes
    - Add foreign key relationship between course_reviews and profiles
    - Update course_reviews table to use profiles.id instead of auth.users.id
    - Add indexes for better query performance

  2. Security
    - Maintain existing RLS policies
*/

-- Update course_reviews table to reference profiles instead of auth.users
ALTER TABLE course_reviews
DROP CONSTRAINT course_reviews_user_id_fkey,
ADD CONSTRAINT course_reviews_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

-- Add index for better join performance
CREATE INDEX IF NOT EXISTS idx_course_reviews_user_id 
ON course_reviews(user_id);

-- Update course reviews view function
CREATE OR REPLACE FUNCTION get_course_reviews(course_id_param uuid)
RETURNS TABLE (
  id uuid,
  course_id uuid,
  user_id uuid,
  rating integer,
  comment text,
  created_at timestamptz,
  updated_at timestamptz,
  username text,
  avatar_url text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cr.id,
    cr.course_id,
    cr.user_id,
    cr.rating,
    cr.comment,
    cr.created_at,
    cr.updated_at,
    p.username,
    p.avatar_url
  FROM course_reviews cr
  JOIN profiles p ON p.id = cr.user_id
  WHERE cr.course_id = course_id_param
  ORDER BY cr.created_at DESC;
END;
$$ LANGUAGE plpgsql;