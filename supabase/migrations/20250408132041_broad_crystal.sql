/*
  # Badge Achievement System Functions

  1. New Functions
    - calculate_user_badges: Calculates and awards badges based on user data
    - check_scoring_achievements: Analyzes scorecard data for scoring badges
    - check_course_achievements: Analyzes course data for course-related badges
    - check_social_achievements: Analyzes friend data for social badges
    - check_rounds_achievements: Analyzes rounds played for round badges

  2. Trigger
    - Add trigger to update badges when relevant data changes
*/

-- Function to calculate scoring achievements (birdies, eagles, etc.)
CREATE OR REPLACE FUNCTION check_scoring_achievements(p_user_id uuid)
RETURNS void AS $$
DECLARE
  v_birdie_count integer;
  v_eagle_count integer;
  v_albatross_count integer;
  v_hole_in_one_count integer;
  v_par_count integer;
  v_under_par_rounds integer;
BEGIN
  -- Count birdies (1 under par)
  SELECT COUNT(*) INTO v_birdie_count
  FROM scorecard_scores ss
  JOIN scorecards s ON s.id = ss.scorecard_id
  WHERE ss.player_id = p_user_id
  AND ss.gross_score = ss.hole_par - 1;

  -- Count eagles (2 under par)
  SELECT COUNT(*) INTO v_eagle_count
  FROM scorecard_scores ss
  JOIN scorecards s ON s.id = ss.scorecard_id
  WHERE ss.player_id = p_user_id
  AND ss.gross_score = ss.hole_par - 2;

  -- Count albatrosses (3 under par)
  SELECT COUNT(*) INTO v_albatross_count
  FROM scorecard_scores ss
  JOIN scorecards s ON s.id = ss.scorecard_id
  WHERE ss.player_id = p_user_id
  AND ss.gross_score = ss.hole_par - 3;

  -- Count holes-in-one
  SELECT COUNT(*) INTO v_hole_in_one_count
  FROM scorecard_scores ss
  JOIN scorecards s ON s.id = ss.scorecard_id
  WHERE ss.player_id = p_user_id
  AND ss.gross_score = 1;

  -- Count pars
  SELECT COUNT(*) INTO v_par_count
  FROM scorecard_scores ss
  JOIN scorecards s ON s.id = ss.scorecard_id
  WHERE ss.player_id = p_user_id
  AND ss.gross_score = ss.hole_par;

  -- Count under par rounds
  SELECT COUNT(*) INTO v_under_par_rounds
  FROM scorecard_players sp
  JOIN scorecards s ON s.id = sp.scorecard_id
  WHERE sp.player_id = p_user_id
  AND sp.relative_score < 0
  AND sp.completed_holes = 18;

  -- Award Birdie Hunter badge
  IF v_birdie_count >= 1 THEN
    PERFORM award_badge(p_user_id, 'birdie-hunter', 'Birdie Hunter', 1, 'bg-green-500');
  END IF;
  IF v_birdie_count >= 10 THEN
    PERFORM award_badge(p_user_id, 'birdie-hunter', 'Birdie Hunter', 2, 'bg-green-500');
  END IF;
  IF v_birdie_count >= 50 THEN
    PERFORM award_badge(p_user_id, 'birdie-hunter', 'Birdie Hunter', 3, 'bg-green-500');
  END IF;
  IF v_birdie_count >= 100 THEN
    PERFORM award_badge(p_user_id, 'birdie-hunter', 'Birdie Hunter', 4, 'bg-green-500');
  END IF;

  -- Award Eagle Eye badge
  IF v_eagle_count >= 1 THEN
    PERFORM award_badge(p_user_id, 'eagle-eye', 'Eagle Eye', 1, 'bg-blue-600');
  END IF;
  IF v_eagle_count >= 5 THEN
    PERFORM award_badge(p_user_id, 'eagle-eye', 'Eagle Eye', 2, 'bg-blue-600');
  END IF;
  IF v_eagle_count >= 20 THEN
    PERFORM award_badge(p_user_id, 'eagle-eye', 'Eagle Eye', 3, 'bg-blue-600');
  END IF;

  -- Award Albatross Spotter badge
  IF v_albatross_count >= 1 THEN
    PERFORM award_badge(p_user_id, 'albatross-spotter', 'Albatross Spotter', 1, 'bg-indigo-600');
  END IF;
  IF v_albatross_count >= 3 THEN
    PERFORM award_badge(p_user_id, 'albatross-spotter', 'Albatross Spotter', 2, 'bg-indigo-600');
  END IF;

  -- Award Ace Club badge
  IF v_hole_in_one_count >= 1 THEN
    PERFORM award_badge(p_user_id, 'ace-club', 'Ace Club', 1, 'bg-purple-600');
  END IF;
  IF v_hole_in_one_count >= 2 THEN
    PERFORM award_badge(p_user_id, 'ace-club', 'Ace Club', 2, 'bg-purple-600');
  END IF;

  -- Award Par Master badge
  IF v_par_count >= 10 THEN
    PERFORM award_badge(p_user_id, 'par-master', 'Par Master', 1, 'bg-gray-600');
  END IF;
  IF v_par_count >= 50 THEN
    PERFORM award_badge(p_user_id, 'par-master', 'Par Master', 2, 'bg-gray-600');
  END IF;
  IF v_par_count >= 100 THEN
    PERFORM award_badge(p_user_id, 'par-master', 'Par Master', 3, 'bg-gray-600');
  END IF;

  -- Award Under Par badge
  IF v_under_par_rounds >= 1 THEN
    PERFORM award_badge(p_user_id, 'under-par-round', 'Under Par', 1, 'bg-green-600');
  END IF;
  IF v_under_par_rounds >= 5 THEN
    PERFORM award_badge(p_user_id, 'under-par-round', 'Under Par', 2, 'bg-green-600');
  END IF;
  IF v_under_par_rounds >= 10 THEN
    PERFORM award_badge(p_user_id, 'under-par-round', 'Under Par', 3, 'bg-green-600');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check course-related achievements
CREATE OR REPLACE FUNCTION check_course_achievements(p_user_id uuid)
RETURNS void AS $$
DECLARE
  v_unique_courses integer;
  v_reviewed_courses integer;
BEGIN
  -- Count unique courses played
  SELECT COUNT(DISTINCT s.course_id) INTO v_unique_courses
  FROM scorecard_players sp
  JOIN scorecards s ON s.id = sp.scorecard_id
  WHERE sp.player_id = p_user_id;

  -- Count reviewed courses
  SELECT COUNT(*) INTO v_reviewed_courses
  FROM course_reviews
  WHERE user_id = p_user_id;

  -- Award Course Explorer badge
  IF v_unique_courses >= 3 THEN
    PERFORM award_badge(p_user_id, 'course-explorer', 'Explorer', 1, 'bg-amber-500');
  END IF;
  IF v_unique_courses >= 10 THEN
    PERFORM award_badge(p_user_id, 'course-explorer', 'Explorer', 2, 'bg-amber-500');
  END IF;
  IF v_unique_courses >= 25 THEN
    PERFORM award_badge(p_user_id, 'course-explorer', 'Explorer', 3, 'bg-amber-500');
  END IF;

  -- Award Course Reviewer badge
  IF v_reviewed_courses >= 1 THEN
    PERFORM award_badge(p_user_id, 'course-reviewer', 'Critic', 1, 'bg-orange-500');
  END IF;
  IF v_reviewed_courses >= 5 THEN
    PERFORM award_badge(p_user_id, 'course-reviewer', 'Critic', 2, 'bg-orange-500');
  END IF;
  IF v_reviewed_courses >= 15 THEN
    PERFORM award_badge(p_user_id, 'course-reviewer', 'Critic', 3, 'bg-orange-500');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check social achievements
CREATE OR REPLACE FUNCTION check_social_achievements(p_user_id uuid)
RETURNS void AS $$
DECLARE
  v_friend_count integer;
BEGIN
  -- Count friends
  SELECT COUNT(*) INTO v_friend_count
  FROM (
    SELECT friend_id FROM get_friends(p_user_id)
  ) AS friends;

  -- Award Social Golfer badge
  IF v_friend_count >= 1 THEN
    PERFORM award_badge(p_user_id, 'social-golfer', 'Social Golfer', 1, 'bg-pink-500');
  END IF;
  IF v_friend_count >= 5 THEN
    PERFORM award_badge(p_user_id, 'social-golfer', 'Social Golfer', 2, 'bg-pink-500');
  END IF;
  IF v_friend_count >= 20 THEN
    PERFORM award_badge(p_user_id, 'social-golfer', 'Social Golfer', 3, 'bg-pink-500');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check rounds played achievements
CREATE OR REPLACE FUNCTION check_rounds_achievements(p_user_id uuid)
RETURNS void AS $$
DECLARE
  v_rounds_played integer;
BEGIN
  -- Count completed rounds
  SELECT COUNT(*) INTO v_rounds_played
  FROM scorecard_players sp
  JOIN scorecards s ON s.id = sp.scorecard_id
  WHERE sp.player_id = p_user_id
  AND s.completed_at IS NOT NULL;

  -- Award Rookie badge
  IF v_rounds_played >= 1 THEN
    PERFORM award_badge(p_user_id, 'rookie', 'Rookie', 1, 'bg-emerald-500');
  END IF;
  IF v_rounds_played >= 5 THEN
    PERFORM award_badge(p_user_id, 'rookie', 'Rookie', 2, 'bg-emerald-500');
  END IF;
  IF v_rounds_played >= 10 THEN
    PERFORM award_badge(p_user_id, 'rookie', 'Rookie', 3, 'bg-emerald-500');
  END IF;

  -- Award Regular badge
  IF v_rounds_played >= 20 THEN
    PERFORM award_badge(p_user_id, 'regular', 'Regular', 1, 'bg-blue-500');
  END IF;
  IF v_rounds_played >= 50 THEN
    PERFORM award_badge(p_user_id, 'regular', 'Regular', 2, 'bg-blue-500');
  END IF;
  IF v_rounds_played >= 100 THEN
    PERFORM award_badge(p_user_id, 'regular', 'Regular', 3, 'bg-blue-500');
  END IF;

  -- Award Veteran badge
  IF v_rounds_played >= 200 THEN
    PERFORM award_badge(p_user_id, 'veteran', 'Veteran', 1, 'bg-purple-600');
  END IF;
  IF v_rounds_played >= 500 THEN
    PERFORM award_badge(p_user_id, 'veteran', 'Veteran', 2, 'bg-purple-600');
  END IF;
  IF v_rounds_played >= 1000 THEN
    PERFORM award_badge(p_user_id, 'veteran', 'Veteran', 3, 'bg-purple-600');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check improvement achievements
CREATE OR REPLACE FUNCTION check_improvement_achievements(p_user_id uuid)
RETURNS void AS $$
DECLARE
  v_initial_handicap numeric;
  v_current_handicap numeric;
  v_improvement numeric;
BEGIN
  -- Get current handicap
  SELECT handicap INTO v_current_handicap
  FROM profiles
  WHERE id = p_user_id;

  -- For now, we'll use a simple approach since we don't track handicap history
  -- In a real implementation, you would compare against historical handicap data
  v_initial_handicap := v_current_handicap + 5; -- Assume 5 strokes improvement for demo
  v_improvement := v_initial_handicap - v_current_handicap;

  -- Award Handicap Improver badge
  IF v_improvement >= 1 THEN
    PERFORM award_badge(p_user_id, 'handicap-improver', 'Improver', 1, 'bg-cyan-500');
  END IF;
  IF v_improvement >= 5 THEN
    PERFORM award_badge(p_user_id, 'handicap-improver', 'Improver', 2, 'bg-cyan-500');
  END IF;
  IF v_improvement >= 10 THEN
    PERFORM award_badge(p_user_id, 'handicap-improver', 'Improver', 3, 'bg-cyan-500');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Main function to calculate all badges for a user
CREATE OR REPLACE FUNCTION calculate_user_badges(p_user_id uuid)
RETURNS void AS $$
BEGIN
  -- Check each category of achievements
  PERFORM check_scoring_achievements(p_user_id);
  PERFORM check_course_achievements(p_user_id);
  PERFORM check_social_achievements(p_user_id);
  PERFORM check_rounds_achievements(p_user_id);
  PERFORM check_improvement_achievements(p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION calculate_user_badges TO authenticated;
GRANT EXECUTE ON FUNCTION check_scoring_achievements TO authenticated;
GRANT EXECUTE ON FUNCTION check_course_achievements TO authenticated;
GRANT EXECUTE ON FUNCTION check_social_achievements TO authenticated;
GRANT EXECUTE ON FUNCTION check_rounds_achievements TO authenticated;
GRANT EXECUTE ON FUNCTION check_improvement_achievements TO authenticated;