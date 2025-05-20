-- Create function to safely delete friend requests with cascading notifications
CREATE OR REPLACE FUNCTION delete_friend_request(
  request_id uuid,
  user_id uuid
) RETURNS void AS $$
BEGIN
  -- Verify the request exists and belongs to the user
  IF NOT EXISTS (
    SELECT 1 FROM friend_requests
    WHERE id = request_id
    AND (sender_id = user_id OR receiver_id = user_id)
  ) THEN
    RAISE EXCEPTION 'Friend request not found or unauthorized';
  END IF;

  -- Delete notifications first (they reference the friend request)
  DELETE FROM notifications
  WHERE friend_request_id = request_id;

  -- Then delete the friend request
  DELETE FROM friend_requests
  WHERE id = request_id
  AND (sender_id = user_id OR receiver_id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_friend_request TO authenticated;

-- Update friend request policies
DROP POLICY IF EXISTS "Players can manage scores" ON friend_requests;
CREATE POLICY "Users can manage their friend requests"
  ON friend_requests
  FOR ALL
  USING (
    auth.uid() = sender_id OR 
    auth.uid() = receiver_id
  );