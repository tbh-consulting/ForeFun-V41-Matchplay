/*
  # Update dog policies for existing courses

  1. Changes
    - Set dog policy for Waregem Golf Club
    - Set dog policy for Championship Course at Damme Golf

  2. Updates
    - Updates existing courses with their respective dog policies
*/

-- Update Waregem Golf Club
UPDATE courses 
SET dog_policy = 'yes'
WHERE id = '4fd5d747-ebca-4e75-acc8-b1e3d3f8a40e';

-- Update Championship Course at Damme Golf
UPDATE courses 
SET dog_policy = 'yes'
WHERE id = '5fd5d747-ebca-4e75-acc8-b1e3d3f8a40f';