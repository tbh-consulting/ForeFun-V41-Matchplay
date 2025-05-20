-- Update like notification function with proper error handling
CREATE OR REPLACE FUNCTION handle_like_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if the scorecard exists
  IF NOT EXISTS (
    SELECT 1 FROM scorecards WHERE id = NEW.scorecard_id
  ) THEN
    RAISE EXCEPTION 'Scorecard not found';
  END IF;

  -- Only proceed if the user exists
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Rest of the function remains the same
  DECLARE
    v_scorecard_creator uuid;
    v_username text;
    v_avatar_url text;
  BEGIN
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
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update comment notification function with proper error handling
CREATE OR REPLACE FUNCTION handle_comment_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if the scorecard exists
  IF NOT EXISTS (
    SELECT 1 FROM scorecards WHERE id = NEW.scorecard_id
  ) THEN
    RAISE EXCEPTION 'Scorecard not found';
  END IF;

  -- Only proceed if the user exists
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Rest of the function remains the same
  DECLARE
    v_scorecard_creator uuid;
    v_username text;
    v_avatar_url text;
  BEGIN
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
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers
DROP TRIGGER IF EXISTS on_like_created ON likes;
DROP TRIGGER IF EXISTS on_comment_created ON comments;

-- Create triggers for notifications
CREATE TRIGGER on_like_created
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW
  EXECUTE FUNCTION handle_like_notification();

CREATE TRIGGER on_comment_created
  AFTER INSERT OR DELETE ON comments
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