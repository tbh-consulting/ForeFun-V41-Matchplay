import { supabase } from '@/lib/supabase';
import { CourseFormData } from '../types';
import { SupabaseError } from '@/lib/supabase/error-handler';

export async function fetchCourses(
  search?: string,
  filters?: CourseFilters,
  sort?: CourseSortOption,
  limit?: number
) {
  // ... existing fetchCourses code ...
}

export async function createCourse(data: CourseFormData) {
  try {
    // Use the create_course function that handles auth.uid() internally
    const { data: result, error } = await supabase.rpc('create_course', {
      p_name: data.course.name,
      p_address: data.course.address,
      p_country: data.course.country,
      p_description: data.course.description || null,
      p_holes: data.course.holes,
      p_dog_policy: data.course.dogPolicy,
      p_image_url: data.course.imageUrl || null
    });

    if (error) {
      throw new SupabaseError('Failed to create course', error);
    }

    const courseId = result;

    // Create holes
    const { error: holesError } = await supabase
      .from('course_holes')
      .insert(
        data.holes.map(hole => ({
          course_id: courseId,
          hole_number: hole.holeNumber,
          par: hole.par,
          handicap: hole.handicap,
          distance_black_meters: hole.distanceBlackMeters,
          distance_white_meters: hole.distanceWhiteMeters,
          distance_yellow_meters: hole.distanceYellowMeters,
          distance_blue_meters: hole.distanceBlueMeters,
          distance_red_meters: hole.distanceRedMeters
        }))
      );

    if (holesError) {
      // If hole creation fails, delete the course to maintain consistency
      await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);
      throw holesError;
    }

    return courseId;
  } catch (error) {
    if (error instanceof SupabaseError) {
      throw error;
    }
    throw new SupabaseError('Failed to create course', error);
  }
}