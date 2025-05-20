import { supabase } from '@/lib/supabase';
import { NewScorecard } from '../types';
import { SupabaseError } from '@/lib/supabase/error-handler';

export async function createScorecard(data: NewScorecard) {
  try {
    // Create scorecard and add creator as player in a single transaction
    const { data: result, error } = await supabase.rpc('create_scorecard', {
      p_course_id: data.courseId,
      p_created_by: data.createdBy,
      p_date: data.date.toISOString(),
      p_weather: data.weather,
      p_player_ids: [] // Empty array since we're only adding creator initially
    });

    if (error) {
      throw new SupabaseError('Failed to create scorecard', error);
    }

    return {
      id: result.scorecard_id,
      courseName: result.course_name
    };
  } catch (error) {
    if (error instanceof SupabaseError) {
      throw error;
    }
    throw new SupabaseError('Failed to create scorecard', error);
  }
}