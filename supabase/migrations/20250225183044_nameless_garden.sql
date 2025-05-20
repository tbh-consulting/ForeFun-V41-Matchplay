-- Create likes table
CREATE TABLE likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  scorecard_id uuid REFERENCES scorecards(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, scorecard_id)
);

-- Create comments table
CREATE TABLE comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  scorecard_id uuid REFERENCES scorecards(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add notification type for likes and comments
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'scorecard_liked';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'scorecard_commented';

-- Enable RLS
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policies for likes
CREATE POLICY "Users can view likes"
  ON likes FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own likes"
  ON likes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for comments
CREATE POLICY "Users can view comments"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own comments"
  ON comments FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to handle like notifications
CREATE OR REPLACE FUNCTION handle_like_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification if the like is not from the scorecard creator
  IF NEW.user_id != (
    SELECT created_by 
    FROM scorecards 
    WHERE id = NEW.scorecard_id
  ) THEN
    INSERT INTO notifications (
      user_id,
      type,
      data
    )
    SELECT
      created_by,
      'scorecard_liked',
      jsonb_build_object(
        'scorecard_id', NEW.scorecard_id,
        'user_id', NEW.user_id,
        'username', (SELECT username FROM profiles WHERE id = NEW.user_id)
      )
    FROM scorecards
    WHERE id = NEW.scorecard_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle comment notifications
CREATE OR REPLACE FUNCTION handle_comment_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification if the comment is not from the scorecard creator
  IF NEW.user_id != (
    SELECT created_by 
    FROM scorecards 
    WHERE id = NEW.scorecard_id
  ) THEN
    INSERT INTO notifications (
      user_id,
      type,
      data
    )
    SELECT
      created_by,
      'scorecard_commented',
      jsonb_build_object(
        'scorecard_id', NEW.scorecard_id,
        'user_id', NEW.user_id,
        'username', (SELECT username FROM profiles WHERE id = NEW.user_id),
        'comment', NEW.content
      )
    FROM scorecards
    WHERE id = NEW.scorecard_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for notifications
CREATE TRIGGER on_like_created
  AFTER INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION handle_like_notification();

CREATE TRIGGER on_comment_created
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION handle_comment_notification();

-- Add indexes for better performance
CREATE INDEX idx_likes_user_scorecard ON likes(user_id, scorecard_id);
CREATE INDEX idx_likes_scorecard_created ON likes(scorecard_id, created_at);
CREATE INDEX idx_comments_scorecard_created ON comments(scorecard_id, created_at);
CREATE INDEX idx_comments_user_id ON comments(user_id);