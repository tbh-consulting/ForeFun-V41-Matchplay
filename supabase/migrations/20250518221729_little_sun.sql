/*
  # Update cleanup_scorecard_data function

  1. Changes
    - Update cleanup_scorecard_data function to handle team-based data cleanup
    - Remove references to deprecated member fields
    - Add proper cleanup for team relationships

  2. Details
    - Function now uses teams table relationship instead of direct member fields
    - Maintains data integrity when deleting scorecards
    - Preserves existing functionality while adapting to new schema
*/

CREATE OR REPLACE FUNCTION cleanup_scorecard_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete any associated team records
  DELETE FROM teams
  WHERE id IN (
    SELECT team_id 
    FROM scorecard_players 
    WHERE scorecard_id = OLD.id
  );

  -- The rest of the cleanup is handled by CASCADE delete constraints
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;