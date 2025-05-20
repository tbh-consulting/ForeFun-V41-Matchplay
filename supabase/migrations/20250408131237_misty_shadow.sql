/*
  # Create Badge Achievements System

  1. New Tables
    - `badge_achievements`: Stores user badge achievements
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `badge_id` (text, badge identifier)
      - `badge_name` (text, badge name)
      - `badge_level` (integer, badge level)
      - `badge_color` (text, badge color class)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on badge_achievements table
    - Add policies for badge achievements
*/

-- Create badge achievements table
CREATE TABLE badge_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id text NOT NULL,
  badge_name text NOT NULL,
  badge_level integer NOT NULL DEFAULT 1,
  badge_color text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id, badge_level)
);

-- Enable RLS
ALTER TABLE badge_achievements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Badge achievements are viewable by everyone"
  ON badge_achievements FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own badge achievements"
  ON badge_achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_badge_achievements_user_id ON badge_achievements(user_id);
CREATE INDEX idx_badge_achievements_badge_id ON badge_achievements(badge_id);
CREATE INDEX idx_badge_achievements_created_at ON badge_achievements(created_at);

-- Create function to award a badge
CREATE OR REPLACE FUNCTION award_badge(
  p_user_id uuid,
  p_badge_id text,
  p_badge_name text,
  p_badge_level integer,
  p_badge_color text
) RETURNS uuid AS $$
DECLARE
  v_achievement_id uuid;
BEGIN
  -- Check if the badge at this level already exists
  IF EXISTS (
    SELECT 1 FROM badge_achievements
    WHERE user_id = p_user_id
    AND badge_id = p_badge_id
    AND badge_level = p_badge_level
  ) THEN
    -- Badge already awarded
    RETURN NULL;
  END IF;

  -- Award the badge
  INSERT INTO badge_achievements (
    user_id,
    badge_id,
    badge_name,
    badge_level,
    badge_color
  ) VALUES (
    p_user_id,
    p_badge_id,
    p_badge_name,
    p_badge_level,
    p_badge_color
  ) RETURNING id INTO v_achievement_id;

  RETURN v_achievement_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION award_badge TO authenticated;