/*
  # Update notification system

  1. Changes
    - Add related_notification_id to link notifications between users
    - Update notification trigger to create paired notifications
    - Add cleanup trigger to handle notification deletion

  2. Security
    - Maintain RLS policies for notifications
    - Ensure users can only access their own notifications
*/

-- Add related_notification_id to notifications table
ALTER TABLE notifications
ADD COLUMN related_notification_id uuid REFERENCES notifications(id) ON DELETE SET NULL;

-- Update friend request notification trigger
CREATE OR REPLACE FUNCTION handle_friend_request_notification()
RETURNS TRIGGER AS $$
DECLARE
  receiver_notif_id uuid;
  sender_notif_id uuid;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Create notification for receiver
    INSERT INTO notifications (user_id, type, data)
    VALUES (
      NEW.receiver_id,
      'friend_request',
      jsonb_build_object(
        'request_id', NEW.id,
        'sender_id', NEW.sender_id
      )
    )
    RETURNING id INTO receiver_notif_id;

  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'accepted' THEN
    -- Create notification for sender
    INSERT INTO notifications (user_id, type, data)
    VALUES (
      NEW.sender_id,
      'friend_accepted',
      jsonb_build_object(
        'request_id', NEW.id,
        'receiver_id', NEW.receiver_id
      )
    )
    RETURNING id INTO sender_notif_id;

    -- Create notification for receiver
    INSERT INTO notifications (user_id, type, data, related_notification_id)
    VALUES (
      NEW.receiver_id,
      'friend_accepted',
      jsonb_build_object(
        'request_id', NEW.id,
        'sender_id', NEW.sender_id
      ),
      sender_notif_id
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