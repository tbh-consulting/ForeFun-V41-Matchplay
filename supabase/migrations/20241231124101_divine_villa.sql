/*
  # Fix notifications and friend requests relationships

  1. Changes
    - Add foreign key from notifications to friend_requests
    - Update notification trigger to handle relationships properly
    - Add indexes for better query performance

  2. Security
    - Maintain existing RLS policies
*/

-- Add foreign key to notifications table
ALTER TABLE notifications
ADD COLUMN friend_request_id uuid REFERENCES friend_requests(id) ON DELETE SET NULL;

-- Update existing notifications to set friend_request_id
UPDATE notifications
SET friend_request_id = (data->>'request_id')::uuid
WHERE data->>'request_id' IS NOT NULL;

-- Update notification trigger
CREATE OR REPLACE FUNCTION handle_friend_request_notification()
RETURNS TRIGGER AS $$
DECLARE
  receiver_notif_id uuid;
  sender_notif_id uuid;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Create notification for receiver
    INSERT INTO notifications (
      user_id,
      type,
      data,
      friend_request_id
    )
    VALUES (
      NEW.receiver_id,
      'friend_request',
      jsonb_build_object(
        'request_id', NEW.id,
        'sender_id', NEW.sender_id
      ),
      NEW.id
    )
    RETURNING id INTO receiver_notif_id;

  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'accepted' THEN
    -- Create notification for sender
    INSERT INTO notifications (
      user_id,
      type,
      data,
      friend_request_id
    )
    VALUES (
      NEW.sender_id,
      'friend_accepted',
      jsonb_build_object(
        'request_id', NEW.id,
        'receiver_id', NEW.receiver_id
      ),
      NEW.id
    )
    RETURNING id INTO sender_notif_id;

    -- Create notification for receiver
    INSERT INTO notifications (
      user_id,
      type,
      data,
      related_notification_id,
      friend_request_id
    )
    VALUES (
      NEW.receiver_id,
      'friend_accepted',
      jsonb_build_object(
        'request_id', NEW.id,
        'sender_id', NEW.sender_id
      ),
      sender_notif_id,
      NEW.id
    )
    RETURNING id INTO receiver_notif_id;

    -- Update sender's notification with receiver's notification id
    UPDATE notifications
    SET related_notification_id = receiver_notif_id
    WHERE id = sender_notif_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_friend_request_id ON notifications(friend_request_id);