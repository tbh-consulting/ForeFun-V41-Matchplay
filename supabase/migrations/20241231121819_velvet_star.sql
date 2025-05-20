/*
  # Enhance User Search

  1. Changes
    - Drop existing search function
    - Create new search function with full name support
    - Add index for full name search
  
  2. Security
    - Function remains SECURITY DEFINER to run with elevated privileges
*/

-- Drop existing function
DROP FUNCTION IF EXISTS search_users(text, uuid, integer);

-- Add index for full name search
CREATE INDEX IF NOT EXISTS idx_profiles_full_name_search ON profiles USING gin(full_name gin_trgm_ops);

-- Create new search function with full name support
CREATE OR REPLACE FUNCTION search_users(
  search_query text,
  current_user_id uuid,
  max_results int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  username text,
  full_name text,
  avatar_url text,
  friend_status text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.full_name,
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
    (
      p.username ILIKE '%' || search_query || '%' OR
      p.full_name ILIKE '%' || search_query || '%'
    )
  ORDER BY 
    CASE 
      WHEN p.username ILIKE search_query || '%' THEN 0
      WHEN p.full_name ILIKE search_query || '%' THEN 1
      ELSE 2
    END,
    p.username
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;