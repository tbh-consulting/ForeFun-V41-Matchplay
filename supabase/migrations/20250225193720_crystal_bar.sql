-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_like_created ON likes;
DROP TRIGGER IF EXISTS on_comment_created ON comments;
DROP FUNCTION IF EXISTS handle_like_notification();
DROP FUNCTION IF EXISTS handle_comment_notification();

-- Create function to verify scorecard exists
CREATE OR REPLACE FUNCTION verify_scorecard(p_scorecard_id uuid)
RETURNS boolean AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM scorecards WHERE id = p_scorecard_id
  ) THEN
    RETURN false;
  END IF;
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to verify user exists
CREATE OR REPLACE FUNCTION verify_user(p_user_id uuid)
RETURNS boolean AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = p_user_id
  ) THEN
    RETURN false;
  END IF;
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update like notification function with proper error handling
CREATE OR REPLACE FUNCTION handle_like_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_scorecard_creator uuid;
  v_username text;
  v_avatar_url text;
BEGIN
  -- Verify scorecard exists
  IF NOT verify_scorecard(NEW.scorecard_id) THEN
    RAISE EXCEPTION 'Scorecard not found';
  END IF;

  -- Verify user exists
  IF NOT verify_user(NEW.user_id) THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Get the scorecard creator
  SELECT created_by INTO v_scorecard_creator
  FROM scorecards 
  WHERE id = NEW.scorecard_id;

  -- Get the username and avatar of the person who liked
  SELECT 
    username,
    avatar_url 
  INTO 
    v_username,
    v_avatar_url
  FROM profiles
  WHERE id = NEW.user_id;

  -- Only create notification if the like is not from the scorecard creator
  IF NEW.user_id != v_scorecard_creator THEN
    INSERT INTO notifications (
      user_id,
      type,
      data
    )
    VALUES (
      v_scorecard_creator,
      'scorecard_liked',
      jsonb_build_object(
        'scorecard_id', NEW.scorecard_id,
        'user_id', NEW.user_id,
        'username', v_username,
        'avatar_url', v_avatar_url
      )
    );
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to process like: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update comment notification function with proper error handling
CREATE OR REPLACE FUNCTION handle_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_scorecard_creator uuid;
  v_username text;
  v_avatar_url text;
BEGIN
  -- Verify scorecard exists
  IF NOT verify_scorecard(NEW.scorecard_id) THEN
    RAISE EXCEPTION 'Scorecard not found';
  END IF;

  -- Verify user exists
  IF NOT verify_user(NEW.user_id) THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Get the scorecard creator
  SELECT created_by INTO v_scorecard_creator
  FROM scorecards 
  WHERE id = NEW.scorecard_id;

  -- Get the username and avatar of the commenter
  SELECT 
    username,
    avatar_url 
  INTO 
    v_username,
    v_avatar_url
  FROM profiles
  WHERE id = NEW.user_id;

  -- Only create notification if the comment is not from the scorecard creator
  IF NEW.user_id != v_scorecard_creator THEN
    INSERT INTO notifications (
      user_id,
      type,
      data
    )
    VALUES (
      v_scorecard_creator,
      'scorecard_commented',
      jsonb_build_object(
        'scorecard_id', NEW.scorecard_id,
        'user_id', NEW.user_id,
        'username', v_username,
        'avatar_url', v_avatar_url,
        'comment', NEW.content
      )
    );
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to process comment: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for notifications
CREATE TRIGGER on_like_created
  AFTER INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION handle_like_notification();

CREATE TRIGGER on_comment_created
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION handle_comment_notification();

-- Add foreign key constraints with proper error handling
ALTER TABLE likes
DROP CONSTRAINT IF EXISTS likes_scorecard_id_fkey,
ADD CONSTRAINT likes_scorecard_id_fkey 
  FOREIGN KEY (scorecard_id) 
  REFERENCES scorecards(id)
  ON DELETE CASCADE;

ALTER TABLE comments
DROP CONSTRAINT IF EXISTS comments_scorecard_id_fkey,
ADD CONSTRAINT comments_scorecard_id_fkey 
  FOREIGN KEY (scorecard_id) 
  REFERENCES scorecards(id)
  ON DELETE CASCADE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_likes_scorecard_user ON likes(scorecard_id, user_id);
CREATE INDEX IF NOT EXISTS idx_comments_scorecard_user ON comments(scorecard_id, user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_type ON notifications(user_id, type);

-- Add validation triggers
CREATE OR REPLACE FUNCTION validate_like()
RETURNS TRIGGER AS $$
BEGIN
  -- Verify scorecard exists
  IF NOT verify_scorecard(NEW.scorecard_id) THEN
    RAISE EXCEPTION 'Scorecard not found';
  END IF;

  -- Verify user exists
  IF NOT verify_user(NEW.user_id) THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_comment()
RETURNS TRIGGER AS $$
BEGIN
  -- Verify scorecard exists
  IF NOT verify_scorecard(NEW.scorecard_id) THEN
    RAISE EXCEPTION 'Scorecard not found';
  END IF;

  -- Verify user exists
  IF NOT verify_user(NEW.user_id) THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Validate comment content
  IF NEW.content IS NULL OR length(trim(NEW.content)) = 0 THEN
    RAISE EXCEPTION 'Comment content cannot be empty';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create validation triggers
CREATE TRIGGER validate_like_before_insert
  BEFORE INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION validate_like();

CREATE TRIGGER validate_comment_before_insert
  BEFORE INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION validate_comment();