import { supabase } from '@/lib/supabase';
import { CourseFormData } from '../types';
import { SupabaseError } from '@/lib/supabase/error-handler';

export async function updateCourse(courseId: string, data: CourseFormData): Promise<void> {
  try {
    // First update the course details
    const { error: courseError } = await supabase
      .from('courses')
      .update({
        name: data.course.name,
        address: data.course.address,
        country: data.course.country,
        description: data.course.description,
        holes: data.course.holes,
        image_url: data.course.imageUrl,
        dog_policy: data.course.dogPolicy,
        updated_at: new Date().toISOString()
      })
      .eq('id', courseId);

    if (courseError) {
      throw new SupabaseError('Failed to update course details', courseError);
    }

    // Then update each hole
    for (const hole of data.holes) {
      const { error: holeError } = await supabase
        .from('course_holes')
        .update({
          par: hole.par,
          handicap: hole.handicap,
          distance_black_meters: hole.distanceBlackMeters,
          distance_white_meters: hole.distanceWhiteMeters,
          distance_yellow_meters: hole.distanceYellowMeters,
          distance_blue_meters: hole.distanceBlueMeters,
          distance_red_meters: hole.distanceRedMeters
        })
        .eq('course_id', courseId)
        .eq('hole_number', hole.holeNumber);

      if (holeError) {
        throw new SupabaseError(`Failed to update hole ${hole.holeNumber}`, holeError);
      }
    }
  } catch (error) {
    if (error instanceof SupabaseError) {
      throw error;
    }
    throw new SupabaseError('Failed to update course', error);
  }
}