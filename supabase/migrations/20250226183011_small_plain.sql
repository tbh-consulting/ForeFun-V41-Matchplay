-- Create teams table with simplified structure
CREATE TABLE teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  member_1 uuid REFERENCES profiles(id) ON DELETE SET NULL,
  member_2 uuid REFERENCES profiles(id) ON DELETE SET NULL,
  member_3 uuid REFERENCES profiles(id) ON DELETE SET NULL,
  member_4 uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view teams they are members of"
  ON teams FOR SELECT
  USING (
    created_by = auth.uid() OR
    member_1 = auth.uid() OR
    member_2 = auth.uid() OR
    member_3 = auth.uid() OR
    member_4 = auth.uid()
  );

CREATE POLICY "Users can create teams"
  ON teams FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Team creators can update their teams"
  ON teams FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Team creators can delete their teams"
  ON teams FOR DELETE
  USING (auth.uid() = created_by);

-- Create indexes
CREATE INDEX idx_teams_created_by ON teams(created_by);
CREATE INDEX idx_teams_members ON teams(member_1, member_2, member_3, member_4);