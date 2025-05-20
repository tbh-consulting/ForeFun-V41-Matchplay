import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/shared/Toast/useToast';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { CourseReview } from '../types';

export function useReviews(courseId: string) {
  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();
  const { user } = useAuth();

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('course_reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          user:profiles!user_id(
            username,
            avatar_url
          )
        `)
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReviews(data?.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.created_at,
        user: {
          username: review.user.username,
          avatarUrl: review.user.avatar_url
        }
      })) || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      addToast('error', 'Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const addReview = async (rating: number, comment: string): Promise<boolean> => {
    if (!user) {
      addToast('error', 'You must be logged in to submit a review');
      return false;
    }

    if (rating === 0) {
      addToast('error', 'Please select a rating');
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
      
      addToast('success', 'Review added successfully');
      await fetchReviews();
      return true;
    } catch (error) {
      console.error('Error adding review:', error);
      addToast('error', 'Failed to add review');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [courseId]);

  return {
    reviews,
    isLoading,
    isSubmitting,
    addReview,
    refresh: fetchReviews
  };
}