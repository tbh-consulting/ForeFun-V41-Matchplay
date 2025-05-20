import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface CourseRating {
  averageRating: number;
  totalReviews: number;
}

export function useCourseRating(courseId: string) {
  const [rating, setRating] = useState<CourseRating>({
    averageRating: 0,
    totalReviews: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRating() {
      try {
        const { data, error } = await supabase
          .from('course_reviews')
          .select('rating')
          .eq('course_id', courseId);

        if (error) throw error;

        if (data && data.length > 0) {
          const total = data.reduce((sum, review) => sum + review.rating, 0);
          setRating({
            averageRating: total / data.length,
            totalReviews: data.length
          });
        }
      } catch (error) {
        console.error('Error fetching course rating:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRating();
  }, [courseId]);

  return { ...rating, isLoading };
}