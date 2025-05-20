/*
  # Create Scorecard Tables

  1. New Tables
    - scorecards: Stores main scorecard info (course, date, weather)
    - scorecard_players: Links players to scorecards
    - scorecard_scores: Stores individual hole scores for each player

  2. Security
    - Enable RLS on all tables
    - Add policies for CRUD operations
*/

-- Create weather type enum
CREATE TYPE weather_condition AS ENUM (
  'sunny',
  'cloudy',
  'partly_cloudy',
  'rainy',
  'windy'
);

-- Create scorecards table
CREATE TABLE scorecards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  weather weather_condition NOT NULL DEFAULT 'sunny',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create scorecard players table
CREATE TABLE scorecard_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scorecard_id uuid REFERENCES scorecards(id) ON DELETE CASCADE NOT NULL,
  player_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  handicap numeric(4,1),
  created_at timestamptz DEFAULT now(),
  UNIQUE(scorecard_id, player_id)
);

-- Create scorecard scores table
CREATE TABLE scorecard_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scorecard_id uuid REFERENCES scorecards(id) ON DELETE CASCADE NOT NULL,
  player_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  hole_number integer NOT NULL CHECK (hole_number BETWEEN 1 AND 18),
  strokes integer CHECK (strokes > 0),
  putts integer CHECK (putts >= 0),
  fairway boolean,
  gir boolean,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(scorecard_id, player_id, hole_number)
);

-- Enable RLS
ALTER TABLE scorecards ENABLE ROW LEVEL SECURITY;
ALTER TABLE scorecard_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE scorecard_scores ENABLE ROW LEVEL SECURITY;

-- Scorecard policies
CREATE POLICY "Users can view scorecards they're part of"
  ON scorecards FOR SELECT
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM scorecard_players
      WHERE scorecard_id = scorecards.id
      AND player_id = auth.uid()
    )
  );

CREATE POLICY "Users can create scorecards"
  ON scorecards FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creator can update scorecard"
  ON scorecards FOR UPDATE
  USING (auth.uid() = created_by);

-- Scorecard players policies
CREATE POLICY "Users can view scorecard players they're part of"
  ON scorecard_players FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM scorecards
      WHERE id = scorecard_players.scorecard_id
      AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM scorecard_players sp
          WHERE sp.scorecard_id = scorecards.id
          AND sp.player_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Creator can manage scorecard players"
  ON scorecard_players FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM scorecards
      WHERE id = scorecard_players.scorecard_id
      AND created_by = auth.uid()
    )
  );

-- Scorecard scores policies
CREATE POLICY "Users can view scores for scorecards they're part of"
  ON scorecard_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM scorecards
      WHERE id = scorecard_scores.scorecard_id
      AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM scorecard_players sp
          WHERE sp.scorecard_id = scorecards.id
          AND sp.player_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Players can manage their own scores"
  ON scorecard_scores FOR ALL
  USING (player_id = auth.uid());

-- Create indexes
CREATE INDEX idx_scorecards_course_id ON scorecards(course_id);
CREATE INDEX idx_scorecards_created_by ON scorecards(created_by);
CREATE INDEX idx_scorecard_players_scorecard_id ON scorecard_players(scorecard_id);
CREATE INDEX idx_scorecard_players_player_id ON scorecard_players(player_id);
CREATE INDEX idx_scorecard_scores_scorecard_id ON scorecard_scores(scorecard_id);
CREATE INDEX idx_scorecard_scores_player_id ON scorecard_scores(player_id);