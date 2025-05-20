-- Add indexes to improve real-time query performance
CREATE INDEX IF NOT EXISTS idx_likes_user_scorecard_ts 
ON likes(user_id, scorecard_id, created_at);

CREATE INDEX IF NOT EXISTS idx_comments_user_scorecard_ts 
ON comments(user_id, scorecard_id, created_at);

-- Add retry_count column to track failed notifications
ALTER TABLE notifications
ADD COLUMN retry_count integer DEFAULT 0;

-- Create function to handle notification retries
CREATE OR REPLACE FUNCTION retry_failed_notification(notification_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE notifications
  SET retry_count = retry_count + 1
  WHERE id = notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update like notification function with better error handling
CREATE OR REPLACE FUNCTION handle_like_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_scorecard_creator uuid;
  v_username text;
  v_avatar_url text;
  v_notification_id uuid;
BEGIN
  -- Get the scorecard creator
  SELECT created_by INTO v_scorecard_creator
  FROM scorecards 
  WHERE id = NEW.scorecard_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Scorecard not found';
  END IF;

  -- Get the username and avatar of the person who liked
  SELECT 
    username,
    avatar_url 
  INTO 
    v_username,
    v_avatar_url
  FROM profiles
  WHERE id = NEW.user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

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
    )
    RETURNING id INTO v_notification_id;
  END IF;

  -- Broadcast the change with user info
  BEGIN
    PERFORM pg_notify(
      'likes_changed',
      json_build_object(
        'id', NEW.id,
        'scorecard_id', NEW.scorecard_id,
        'user_id', NEW.user_id,
        'username', v_username,
        'avatar_url', v_avatar_url,
        'type', TG_OP,
        'created_at', NEW.created_at,
        'notification_id', v_notification_id
      )::text
    );
  EXCEPTION WHEN OTHERS THEN
    -- Log error and increment retry count
    IF v_notification_id IS NOT NULL THEN
      PERFORM retry_failed_notification(v_notification_id);
    END IF;
    RAISE NOTICE 'Failed to send notification: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update comment notification function with better error handling
CREATE OR REPLACE FUNCTION handle_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_scorecard_creator uuid;
  v_username text;
  v_avatar_url text;
  v_notification_id uuid;
BEGIN
  -- Get the scorecard creator
  SELECT created_by INTO v_scorecard_creator
  FROM scorecards 
  WHERE id = NEW.scorecard_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Scorecard not found';
  END IF;

  -- Get the username and avatar of the commenter
  SELECT 
    username,
    avatar_url 
  INTO 
    v_username,
    v_avatar_url
  FROM profiles
  WHERE id = NEW.user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

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
    )
    RETURNING id INTO v_notification_id;
  END IF;

  -- Broadcast the change with user info
  BEGIN
    PERFORM pg_notify(
      'comments_changed',
      json_build_object(
        'id', NEW.id,
        'scorecard_id', NEW.scorecard_id,
        'user_id', NEW.user_id,
        'username', v_username,
        'avatar_url', v_avatar_url,
        'content', NEW.content,
        'type', TG_OP,
        'created_at', NEW.created_at,
        'notification_id', v_notification_id
      )::text
    );
  EXCEPTION WHEN OTHERS THEN
    -- Log error and increment retry count
    IF v_notification_id IS NOT NULL THEN
      PERFORM retry_failed_notification(v_notification_id);
    END IF;
    RAISE NOTICE 'Failed to send notification: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers
DROP TRIGGER IF EXISTS on_like_created ON likes;
DROP TRIGGER IF EXISTS on_comment_created ON comments;

-- Create triggers for notifications and broadcasts
CREATE TRIGGER on_like_created
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW
  EXECUTE FUNCTION handle_like_notification();

CREATE TRIGGER on_comment_created
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION handle_comment_notification();