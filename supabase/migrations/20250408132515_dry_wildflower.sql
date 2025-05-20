-- Function to get user scoring statistics
CREATE OR REPLACE FUNCTION get_user_scoring_stats(user_id uuid)
RETURNS TABLE (
  birdies integer,
  eagles integer,
  albatrosses integer,
  hole_in_ones integer,
  pars integer,
  bogeys integer,
  double_bogeys integer,
  triple_bogeys integer,
  worse integer,
  under_par_rounds integer
) AS $$
DECLARE
  score_counts RECORD;
  under_par_rounds_count integer;
BEGIN
  -- Count different score types
  SELECT
    COUNT(*) FILTER (WHERE gross_score = hole_par - 1) AS birdies,
    COUNT(*) FILTER (WHERE gross_score = hole_par - 2) AS eagles,
    COUNT(*) FILTER (WHERE gross_score = hole_par - 3) AS albatrosses,
    COUNT(*) FILTER (WHERE gross_score = 1) AS hole_in_ones,
    COUNT(*) FILTER (WHERE gross_score = hole_par) AS pars,
    COUNT(*) FILTER (WHERE gross_score = hole_par + 1) AS bogeys,
    COUNT(*) FILTER (WHERE gross_score = hole_par + 2) AS double_bogeys,
    COUNT(*) FILTER (WHERE gross_score = hole_par + 3) AS triple_bogeys,
    COUNT(*) FILTER (WHERE gross_score > hole_par + 3) AS worse
  INTO score_counts
  FROM scorecard_scores
  WHERE player_id = user_id
  AND gross_score IS NOT NULL;

  -- Count rounds completed under par
  SELECT
    COUNT(*)
  INTO under_par_rounds_count
  FROM scorecard_players sp
  JOIN scorecards s ON s.id = sp.scorecard_id
  WHERE sp.player_id = user_id
  AND sp.relative_score < 0
  AND sp.completed_holes = 18;

  -- Return the results
  birdies := COALESCE(score_counts.birdies, 0);
  eagles := COALESCE(score_counts.eagles, 0);
  albatrosses := COALESCE(score_counts.albatrosses, 0);
  hole_in_ones := COALESCE(score_counts.hole_in_ones, 0);
  pars := COALESCE(score_counts.pars, 0);
  bogeys := COALESCE(score_counts.bogeys, 0);
  double_bogeys := COALESCE(score_counts.double_bogeys, 0);
  triple_bogeys := COALESCE(score_counts.triple_bogeys, 0);
  worse := COALESCE(score_counts.worse, 0);
  under_par_rounds := COALESCE(under_par_rounds_count, 0);

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_scoring_stats TO authenticated;