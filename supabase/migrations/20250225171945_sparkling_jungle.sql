-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Players can view scorecards" ON scorecards;
DROP POLICY IF EXISTS "Players can view scorecard players" ON scorecard_players;
DROP POLICY IF EXISTS "Players can view scores" ON scorecard_scores;
DROP POLICY IF EXISTS "Creators can manage scorecards" ON scorecards;
DROP POLICY IF EXISTS "Creators can manage scorecard players" ON scorecard_players;
DROP POLICY IF EXISTS "Creators can manage scores" ON scorecard_scores;

-- Create open access policies for authenticated users
CREATE POLICY "Authenticated users can access scorecards"
  ON scorecards FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can access scorecard players"
  ON scorecard_players FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can access scores"
  ON scorecard_scores FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create open access policies for courses and related tables
CREATE POLICY "Authenticated users can access courses"
  ON courses FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can access course holes"
  ON course_holes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can access course reviews"
  ON course_reviews FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create open access policies for friend requests and notifications
CREATE POLICY "Authenticated users can access friend requests"
  ON friend_requests FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can access notifications"
  ON notifications FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create open access policy for profiles
-- Note: We keep the auth.users table protected by default
CREATE POLICY "Authenticated users can access profiles"
  ON profiles FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);