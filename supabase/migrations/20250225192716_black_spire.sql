-- Add indexes to improve real-time query performance
CREATE INDEX IF NOT EXISTS idx_likes_user_scorecard_ts 
ON likes(user_id, scorecard_id, created_at);

CREATE INDEX IF NOT EXISTS idx_comments_user_scorecard_ts 
ON comments(user_id, scorecard_id, created_at);

-- Update like notification function to include more context
CREATE OR REPLACE FUNCTION handle_like_notification()
RETURNS TRIGGER AS $$
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

  -- Broadcast the change with user info
  PERFORM pg_notify(
    'likes_changed',
    json_build_object(
      'id', NEW.id,
      'scorecard_id', NEW.scorecard_id,
      'user_id', NEW.user_id,
      'username', v_username,
      'avatar_url', v_avatar_url,
      'type', TG_OP,
      'created_at', NEW.created_at
    )::text
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update comment notification function to include more context
CREATE OR REPLACE FUNCTION handle_comment_notification()
RETURNS TRIGGER AS $$
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

  -- Broadcast the change with user info
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
      'created_at', NEW.created_at
    )::text
  );

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