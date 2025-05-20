/*
  # Friends and Notifications System

  1. New Tables
    - `friend_requests`
      - `id` (uuid, primary key)
      - `sender_id` (uuid, references profiles)
      - `receiver_id` (uuid, references profiles)
      - `status` (enum: pending, accepted, rejected)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `type` (enum: friend_request, friend_accepted)
      - `data` (jsonb)
      - `read` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for friend requests and notifications
*/

-- Create friend request status enum
CREATE TYPE friend_request_status AS ENUM ('pending', 'accepted', 'rejected');

-- Create notification type enum
CREATE TYPE notification_type AS ENUM ('friend_request', 'friend_accepted');

-- Create friend requests table
CREATE TABLE IF NOT EXISTS friend_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status friend_request_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(sender_id, receiver_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  data jsonb NOT NULL DEFAULT '{}',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Friend requests policies
CREATE POLICY "Users can view their own friend requests"
  ON friend_requests
  FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create friend requests"
  ON friend_requests
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received friend requests"
  ON friend_requests
  FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to handle friend request notifications
CREATE OR REPLACE FUNCTION handle_friend_request_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Create notification for friend request
    INSERT INTO notifications (user_id, type, data)
    VALUES (
      NEW.receiver_id,
      'friend_request',
      jsonb_build_object(
        'request_id', NEW.id,
        'sender_id', NEW.sender_id
      )
    );
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'accepted' THEN
    -- Create notification for accepted request
    INSERT INTO notifications (user_id, type, data)
    VALUES (
      NEW.sender_id,
      'friend_accepted',
      jsonb_build_object(
        'request_id', NEW.id,
        'receiver_id', NEW.receiver_id
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for friend request notifications
CREATE TRIGGER on_friend_request_created
  AFTER INSERT ON friend_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_friend_request_notification();

CREATE TRIGGER on_friend_request_updated
  AFTER UPDATE ON friend_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_friend_request_notification();

-- Function to get friends list
CREATE OR REPLACE FUNCTION get_friends(user_id uuid)
RETURNS TABLE (friend_id uuid) AS $$
BEGIN
  RETURN QUERY
    SELECT 
      CASE 
        WHEN fr.sender_id = user_id THEN fr.receiver_id
        ELSE fr.sender_id
      END AS friend_id
    FROM friend_requests fr
    WHERE 
      (fr.sender_id = user_id OR fr.receiver_id = user_id)
      AND fr.status = 'accepted';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;