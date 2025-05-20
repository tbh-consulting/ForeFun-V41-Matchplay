-- Create activity type enum
CREATE TYPE activity_type AS ENUM (
  'course_created',
  'scorecard_created', 
  'friend_added',
  'course_reviewed'
);

-- Create activities table
CREATE TABLE activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type activity_type NOT NULL,
  data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_created_at ON activities(created_at);
CREATE INDEX idx_activities_type ON activities(type);

-- Create policies
CREATE POLICY "Users can view activities from friends and self"
  ON activities FOR SELECT
  USING (
    user_id = auth.uid() OR
    user_id IN (
      SELECT CASE 
        WHEN sender_id = auth.uid() THEN receiver_id
        ELSE sender_id
      END
      FROM friend_requests
      WHERE status = 'accepted'
      AND (sender_id = auth.uid() OR receiver_id = auth.uid())
    )
  );

-- Create trigger function for course creation
CREATE OR REPLACE FUNCTION handle_course_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activities (user_id, type, data)
  VALUES (
    NEW.created_by,
    'course_created',
    jsonb_build_object(
      'courseId', NEW.id,
      'courseName', NEW.name
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function for scorecard creation
CREATE OR REPLACE FUNCTION handle_scorecard_created()
RETURNS TRIGGER AS $$
DECLARE
  v_course_name text;
BEGIN
  SELECT name INTO v_course_name
  FROM courses
  WHERE id = NEW.course_id;

  INSERT INTO activities (user_id, type, data)
  VALUES (
    NEW.created_by,
    'scorecard_created',
    jsonb_build_object(
      'scorecardId', NEW.id,
      'courseId', NEW.course_id,
      'courseName', v_course_name
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function for friend requests
CREATE OR REPLACE FUNCTION handle_friend_added()
RETURNS TRIGGER AS $$
DECLARE
  v_sender_name text;
  v_receiver_name text;
BEGIN
  IF NEW.status = 'accepted' THEN
    -- Get usernames
    SELECT username INTO v_sender_name
    FROM profiles
    WHERE id = NEW.sender_id;

    SELECT username INTO v_receiver_name
    FROM profiles
    WHERE id = NEW.receiver_id;

    -- Create activity for sender
    INSERT INTO activities (user_id, type, data)
    VALUES (
      NEW.sender_id,
      'friend_added',
      jsonb_build_object(
        'friendId', NEW.receiver_id,
        'friendName', v_receiver_name
      )
    );

    -- Create activity for receiver
    INSERT INTO activities (user_id, type, data)
    VALUES (
      NEW.receiver_id,
      'friend_added',
      jsonb_build_object(
        'friendId', NEW.sender_id,
        'friendName', v_sender_name
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function for course reviews
CREATE OR REPLACE FUNCTION handle_course_reviewed()
RETURNS TRIGGER AS $$
DECLARE
  v_course_name text;
BEGIN
  SELECT name INTO v_course_name
  FROM courses
  WHERE id = NEW.course_id;

  INSERT INTO activities (user_id, type, data)
  VALUES (
    NEW.user_id,
    'course_reviewed',
    jsonb_build_object(
      'courseId', NEW.course_id,
      'courseName', v_course_name,
      'rating', NEW.rating,
      'review', NEW.comment
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER on_course_created
  AFTER INSERT ON courses
  FOR EACH ROW
  EXECUTE FUNCTION handle_course_created();

CREATE TRIGGER on_scorecard_created
  AFTER INSERT ON scorecards
  FOR EACH ROW
  EXECUTE FUNCTION handle_scorecard_created();

CREATE TRIGGER on_friend_added
  AFTER UPDATE ON friend_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_friend_added();

CREATE TRIGGER on_course_reviewed
  AFTER INSERT ON course_reviews
  FOR EACH ROW
  EXECUTE FUNCTION handle_course_reviewed();