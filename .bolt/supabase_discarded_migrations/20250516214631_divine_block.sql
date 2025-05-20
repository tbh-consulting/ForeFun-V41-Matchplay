/*
  # Add badge_earned to notification_type enum

  1. Changes
    - Add 'badge_earned' value to notification_type enum
    - Update notification handling functions to support badge notifications

  2. Security
    - No changes to RLS policies required
    - Existing notification permissions apply to badge notifications
*/

-- Add new enum value if it doesn't exist
DO $$
BEGIN
  ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'badge_earned';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Update notification handling functions to include badge support
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
      'type', TG_OP,
      'like_id', NEW.id
    )::text
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
      'comment_id', NEW.id,
      'comment', NEW.content,
      'created_at', NEW.created_at
    )::text
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;