/*
  # Calculate All User Badges

  1. New Function
    - calculate_all_user_badges: Recalculates badges for all users
*/

-- Function to calculate badges for all users
CREATE OR REPLACE FUNCTION calculate_all_user_badges()
RETURNS void AS $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM profiles LOOP
    PERFORM calculate_user_badges(user_record.id);
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION calculate_all_user_badges TO authenticated;