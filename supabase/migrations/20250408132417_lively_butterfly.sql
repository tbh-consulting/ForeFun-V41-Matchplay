-- Function to handle badge achievement notifications
CREATE OR REPLACE FUNCTION handle_badge_achievement_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Create activity record for badge achievement
  INSERT INTO notifications (
    user_id,
    type,
    data
  )
  VALUES (
    NEW.user_id,
    'badge_earned',
    jsonb_build_object(
      'badge_id', NEW.badge_id,
      'badge_name', NEW.badge_name,
      'badge_level', NEW.badge_level,
      'badge_color', NEW.badge_color
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for badge achievement notifications
CREATE TRIGGER on_badge_achievement
  AFTER INSERT ON badge_achievements
  FOR EACH ROW
  EXECUTE FUNCTION handle_badge_achievement_notification();

-- Trigger to recalculate scoring achievements when scores change
CREATE OR REPLACE FUNCTION trigger_scoring_achievements()
RETURNS TRIGGER AS $$
DECLARE
  player_id uuid;
BEGIN
  -- Determine the player_id based on operation type
  IF TG_OP = 'DELETE' THEN
    player_id := OLD.player_id;
  ELSE
    player_id := NEW.player_id;
  END IF;

  -- Recalculate scoring achievements for the affected player
  PERFORM check_scoring_achievements(player_id);
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to recalculate course achievements when a player plays a new course
CREATE OR REPLACE FUNCTION trigger_course_achievements()
RETURNS TRIGGER AS $$
DECLARE
  player_id uuid;
BEGIN
  -- Determine the player_id based on operation type
  IF TG_OP = 'DELETE' THEN
    player_id := OLD.player_id;
  ELSE
    player_id := NEW.player_id;
  END IF;

  -- Recalculate course achievements for the affected player
  PERFORM check_course_achievements(player_id);
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to recalculate rounds achievements when a scorecard is completed
CREATE OR REPLACE FUNCTION trigger_rounds_achievements()
RETURNS TRIGGER AS $$
DECLARE
  player_record RECORD;
BEGIN
  -- Only trigger when a scorecard is marked as completed
  IF TG_OP = 'UPDATE' AND OLD.completed_at IS NULL AND NEW.completed_at IS NOT NULL THEN
    -- Get all players in this scorecard
    FOR player_record IN 
      SELECT player_id FROM scorecard_players WHERE scorecard_id = NEW.id
    LOOP
      PERFORM check_rounds_achievements(player_record.player_id);
    END LOOP;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to recalculate social achievements when a friend request is accepted
CREATE OR REPLACE FUNCTION trigger_social_achievements()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when a friend request is accepted
  IF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'accepted' THEN
    PERFORM check_social_achievements(NEW.sender_id);
    PERFORM check_social_achievements(NEW.receiver_id);
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER on_score_change
  AFTER INSERT OR UPDATE OR DELETE ON scorecard_scores
  FOR EACH ROW
  EXECUTE FUNCTION trigger_scoring_achievements();

CREATE TRIGGER on_scorecard_player_change
  AFTER INSERT ON scorecard_players
  FOR EACH ROW
  EXECUTE FUNCTION trigger_course_achievements();

CREATE TRIGGER on_scorecard_completion
  AFTER UPDATE ON scorecards
  FOR EACH ROW
  EXECUTE FUNCTION trigger_rounds_achievements();

CREATE TRIGGER on_friend_request_accepted
  AFTER UPDATE ON friend_requests
  FOR EACH ROW
  EXECUTE FUNCTION trigger_social_achievements();