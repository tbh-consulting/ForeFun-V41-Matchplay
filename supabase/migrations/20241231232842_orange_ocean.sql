-- Create function to calculate points
CREATE OR REPLACE FUNCTION calculate_points(
  gross_score integer,
  hole_par integer,
  handicap_strokes integer
) RETURNS integer AS $$
BEGIN
  -- Return null if no gross score
  IF gross_score IS NULL THEN
    RETURN NULL;
  END IF;

  -- Calculate net score (gross - handicap strokes)
  -- Then calculate points as (par + 2 - net score)
  -- Ensure minimum of 0 points
  RETURN GREATEST(0, hole_par + 2 - (gross_score - handicap_strokes));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create trigger function to update points when gross score changes
CREATE OR REPLACE FUNCTION update_score_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update points if gross_score has changed
  IF TG_OP = 'UPDATE' AND NEW.gross_score IS DISTINCT FROM OLD.gross_score
     OR TG_OP = 'INSERT' AND NEW.gross_score IS NOT NULL THEN
    
    NEW.points := calculate_points(
      NEW.gross_score,
      NEW.hole_par,
      NEW.handicap_strokes
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_points ON scorecard_scores;
CREATE TRIGGER update_points
  BEFORE INSERT OR UPDATE ON scorecard_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_score_points();

-- Test the points calculation
DO $$
BEGIN
  -- Test basic points calculation
  ASSERT calculate_points(4, 4, 0) = 2; -- Par
  ASSERT calculate_points(3, 4, 0) = 3; -- Birdie
  ASSERT calculate_points(5, 4, 0) = 1; -- Bogey
  ASSERT calculate_points(7, 4, 0) = 0; -- Triple bogey (minimum 0)
  
  -- Test with handicap strokes
  ASSERT calculate_points(5, 4, 1) = 2; -- Net par (5-1 = 4)
  ASSERT calculate_points(6, 4, 2) = 2; -- Net par (6-2 = 4)
  ASSERT calculate_points(4, 4, 1) = 3; -- Net birdie
  ASSERT calculate_points(7, 4, 2) = 1; -- Net bogey
END $$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION calculate_points TO authenticated;
GRANT EXECUTE ON FUNCTION update_score_points TO authenticated;