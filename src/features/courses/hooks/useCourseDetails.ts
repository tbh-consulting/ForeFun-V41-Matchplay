import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/shared/Toast/useToast';
import { supabase } from '@/lib/supabase';
import { Course } from '../types';
import { SupabaseError } from '@/lib/supabase/error-handler';
import { isSupabaseConfigured } from '@/lib/supabase';

export function useCourseDetails(courseId: string) {
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const loadCourse = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setError('Database connection not configured');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('courses')
        .select(`
          id,
          name,
          address,
          country,
          description,
          holes,
          image_url,
          dog_policy,
          created_by,
          created_at,
          updated_at,
          course_holes (
            id,
            hole_number,
            par,
            handicap,
            distance_black_meters,
            distance_white_meters,
            distance_yellow_meters,
            distance_blue_meters,
            distance_red_meters
          ),
          course_reviews (
            id,
            rating,
            comment,
            created_at,
            user:profiles!course_reviews_user_id_fkey (
              username,
              avatar_url
            )
          )
        `)
        .eq('id', courseId)
        .single();

      if (error) throw error;

      setCourse({
        id: data.id,
        name: data.name,
        address: data.address,
        country: data.country,
        description: data.description,
        holes: data.holes,
        imageUrl: data.image_url,
        dogPolicy: data.dog_policy,
        createdBy: data.created_by,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        courseHoles: data.course_holes?.map(hole => ({
          id: hole.id,
          courseId: data.id,
          holeNumber: hole.hole_number,
          par: hole.par,
          handicap: hole.handicap,
          distanceBlackMeters: hole.distance_black_meters,
          distanceWhiteMeters: hole.distance_white_meters,
          distanceYellowMeters: hole.distance_yellow_meters,
          distanceBlueMeters: hole.distance_blue_meters,
          distanceRedMeters: hole.distance_red_meters
        })),
        reviews: data.course_reviews?.map(review => ({
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.created_at,
          user: {
            username: review.user.username,
            avatarUrl: review.user.avatar_url
          }
        }))
      });
    } catch (error) {
      console.error('Error fetching course:', error);
      const message = error instanceof SupabaseError 
        ? error.message 
        : 'Failed to load course details';
      
      setError(message);
      addToast('error', message);
      
      if (error instanceof SupabaseError && error.message.includes('not found')) {
        navigate('/courses');
      }
    } finally {
      setIsLoading(false);
    }
  }, [courseId, addToast, navigate]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  return { 
    course, 
    isLoading,
    error,
    refresh: loadCourse
  };
}