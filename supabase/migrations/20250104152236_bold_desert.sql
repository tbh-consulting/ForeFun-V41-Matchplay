-- First remove any invalid references
DELETE FROM activities 
WHERE scorecard_id IS NOT NULL 
AND scorecard_id NOT IN (SELECT id FROM scorecards);

-- Update the foreign key constraint
ALTER TABLE activities
DROP CONSTRAINT IF EXISTS activities_scorecard_id_fkey,
ADD CONSTRAINT activities_scorecard_id_fkey 
  FOREIGN KEY (scorecard_id) 
  REFERENCES scorecards(id) 
  ON DELETE SET NULL;

-- Add validation check
ALTER TABLE activities
ADD CONSTRAINT valid_scorecard_reference
  CHECK (
    (type != 'scorecard_created' AND scorecard_id IS NULL) OR
    (type = 'scorecard_created' AND scorecard_id IS NOT NULL)
  );

-- Update existing activities to ensure data consistency
UPDATE activities
SET scorecard_id = (data->>'scorecardId')::uuid
WHERE type = 'scorecard_created'
AND scorecard_id IS NULL
AND (data->>'scorecardId')::uuid IN (SELECT id FROM scorecards);