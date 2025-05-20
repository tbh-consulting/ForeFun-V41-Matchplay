import { supabase } from '@/lib/supabase';
import { NewScorecard } from '../types';

export async function createScorecard(data: NewScorecard) {
  // Create scorecard with players in one database call
  const { data: result, error } = await supabase
    .rpc('create_scorecard', {
      p_course_id: data.courseId,
      p_created_by: data.createdBy,
      p_date: data.date.toISOString(),
      p_weather: data.weather,
      p_player_ids: data.players // Additional players (creator is added automatically)
    });

  if (error) {
    console.error('Error creating scorecard:', error);
    throw error;
  }

  return {
    id: result.scorecard_id,
    courseName: result.course_name
  };
}