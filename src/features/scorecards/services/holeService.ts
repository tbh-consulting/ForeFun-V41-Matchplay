import { supabase } from '@/lib/supabase';
import { CourseHole } from '../types';

export async function fetchHoleInformation(courseId: string): Promise<CourseHole[]> {
  const { data, error } = await supabase
    .from('course_holes')
    .select('*')
    .eq('course_id', courseId)
    .order('hole_number');

  if (error) {
    console.error('Error fetching hole information:', error);
    throw error;
  }

  return data.map(hole => ({
    id: hole.id,
    holeNumber: hole.hole_number,
    par: hole.par,
    handicap: hole.handicap,
    distanceBlackMeters: hole.distance_black_meters,
    distanceWhiteMeters: hole.distance_white_meters,
    distanceYellowMeters: hole.distance_yellow_meters,
    distanceBlueMeters: hole.distance_blue_meters,
    distanceRedMeters: hole.distance_red_meters
  }));
}