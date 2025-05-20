import { useState } from 'react';
import { useToast } from '@/components/shared/Toast/useToast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function useCourseReview(courseId: string) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();
  const { user } = useAuth();

  const submitReview = async (rating: number, comment: string) => {
    if (!user) {
      addToast('error', 'You must be logged in to submit a review');
      return false;
    }

    if (rating < 1 || rating > 5) {
      addToast('error', 'Rating must be between 1 and 5 stars');
      return false;
    }

    try {
      setIsSubmitting(true);

      // Check if user already reviewed this course
      const { data: existingReview } = await supabase
        .from('course_reviews')
        .select('id')
        .eq('course_id', courseId)
        .eq('user_id', user.id)
        .single();

      if (existingReview) {
        addToast('error', 'You have already reviewed this course');
        return false;
      }

      const { error } = await supabase
        .from('course_reviews')
        .insert({
          course_id: courseId,
          user_id: user.id,
          rating,
          comment: comment.trim() || null
        });

      if (error) throw error;

      addToast('success', 'Review submitted successfully');
      return true;
    } catch (error) {
      console.error('Error submitting review:', error);
      addToast('error', 'Failed to submit review');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitReview,
    isSubmitting
  };
}