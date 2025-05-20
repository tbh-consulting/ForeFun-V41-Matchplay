/*
  # Golf Course Management Schema

  1. New Tables
    - `courses`: Stores golf course information
    - `course_holes`: Stores hole-specific data
    - `course_reviews`: Stores user reviews and ratings

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create courses table
CREATE TABLE courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  description text,
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  holes integer NOT NULL CHECK (holes IN (9, 18)),
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create course_holes table
CREATE TABLE course_holes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  hole_number integer NOT NULL CHECK (hole_number BETWEEN 1 AND 18),
  par integer NOT NULL CHECK (par BETWEEN 3 AND 6),
  handicap integer NOT NULL CHECK (handicap BETWEEN 1 AND 18),
  distance_black integer,
  distance_white integer,
  distance_yellow integer,
  distance_blue integer,
  distance_red integer,
  UNIQUE(course_id, hole_number),
  UNIQUE(course_id, handicap)
);

-- Create course_reviews table
CREATE TABLE course_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(course_id, user_id)
);

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_holes ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;

-- Courses policies
CREATE POLICY "Courses are viewable by everyone"
  ON courses FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create courses"
  ON courses FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own courses"
  ON courses FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- Course holes policies
CREATE POLICY "Course holes are viewable by everyone"
  ON course_holes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage course holes"
  ON course_holes FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM courses
    WHERE id = course_holes.course_id
    AND created_by = auth.uid()
  ));

-- Course reviews policies
CREATE POLICY "Course reviews are viewable by everyone"
  ON course_reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON course_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON course_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_courses_name ON courses(name);
CREATE INDEX idx_courses_location ON courses(location);
CREATE INDEX idx_course_holes_course_id ON course_holes(course_id);
CREATE INDEX idx_course_reviews_course_id ON course_reviews(course_id);