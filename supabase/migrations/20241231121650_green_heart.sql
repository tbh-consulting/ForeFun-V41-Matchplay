/*
  # Add User Search Functionality

  1. Changes
    - Add pg_trgm extension for better text search
    - Add function to search users with friend status
    - Add indexes for better search performance
  
  2. Security
    - Function is marked as SECURITY DEFINER to run with elevated privileges
*/

-- First create the extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_profiles_username_search ON profiles USING gin(username gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- Function to search users
CREATE OR REPLACE FUNCTION search_users(
  search_query text,
  current_user_id uuid,
  max_results int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  username text,
  avatar_url text,
  friend_status text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.avatar_url,
    COALESCE(
      CASE 
        WHEN fr.status = 'accepted' THEN 'friends'
        WHEN fr.status = 'pending' AND fr.sender_id = current_user_id THEN 'pending_sent'
        WHEN fr.status = 'pending' AND fr.receiver_id = current_user_id THEN 'pending_received'
        ELSE 'none'
      END,
      'none'
    ) as friend_status
  FROM profiles p
  LEFT JOIN friend_requests fr ON 
    (fr.sender_id = current_user_id AND fr.receiver_id = p.id) OR
    (fr.receiver_id = current_user_id AND fr.sender_id = p.id)
  WHERE 
    p.id != current_user_id AND
    p.username ILIKE '%' || search_query || '%'
  ORDER BY 
    CASE WHEN p.username ILIKE search_query || '%' THEN 0 ELSE 1 END,
    p.username
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;