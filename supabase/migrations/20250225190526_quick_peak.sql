-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_like_created ON likes;
DROP TRIGGER IF EXISTS on_comment_created ON comments;
DROP FUNCTION IF EXISTS handle_like_notification();
DROP FUNCTION IF EXISTS handle_comment_notification();

-- Create function to handle like notifications with broadcast
CREATE OR REPLACE FUNCTION handle_like_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_scorecard_creator uuid;
  v_username text;
BEGIN
  -- Get the scorecard creator
  SELECT created_by INTO v_scorecard_creator
  FROM scorecards 
  WHERE id = NEW.scorecard_id;

  -- Get the username of the person who liked
  SELECT username INTO v_username
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
        'username', v_username
      )
    );
  END IF;

  -- Broadcast the change
  PERFORM pg_notify(
    'likes_changed',
    json_build_object(
      'scorecard_id', NEW.scorecard_id,
      'user_id', NEW.user_id,
      'type', TG_OP
    )::text
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle comment notifications with broadcast
CREATE OR REPLACE FUNCTION handle_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_scorecard_creator uuid;
  v_username text;
BEGIN
  -- Get the scorecard creator
  SELECT created_by INTO v_scorecard_creator
  FROM scorecards 
  WHERE id = NEW.scorecard_id;

  -- Get the username of the commenter
  SELECT username INTO v_username
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
        'comment', NEW.content
      )
    );
  END IF;

  -- Broadcast the change
  PERFORM pg_notify(
    'comments_changed',
    json_build_object(
      'scorecard_id', NEW.scorecard_id,
      'user_id', NEW.user_id,
      'type', TG_OP,
      'comment_id', NEW.id
    )::text
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for notifications and broadcasts
CREATE TRIGGER on_like_created
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW
  EXECUTE FUNCTION handle_like_notification();

CREATE TRIGGER on_comment_created
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION handle_comment_notification();

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_likes_user_scorecard ON likes(user_id, scorecard_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_scorecard ON comments(user_id, scorecard_id);