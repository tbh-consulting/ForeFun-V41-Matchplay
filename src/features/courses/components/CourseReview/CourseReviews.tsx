import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { ReviewForm } from './ReviewForm';
import { ReviewList } from './ReviewList';
import { useCourseReview } from '../../hooks/useCourseReview';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { CourseReview } from '../../types';

interface CourseReviewsProps {
  courseId: string;
  reviews: CourseReview[];
  onReviewAdded: () => void;
}

export function CourseReviews({ courseId, reviews, onReviewAdded }: CourseReviewsProps) {
  const [showForm, setShowForm] = useState(false);
  const { isAuthenticated } = useAuth();
  const { submitReview, isSubmitting } = useCourseReview(courseId);

  const handleSubmit = async (rating: number, comment: string) => {
    const success = await submitReview(rating, comment);
    if (success) {
      setShowForm(false);
      // Wait for the database to update before refreshing
      setTimeout(onReviewAdded, 500);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-gray-900">Reviews</h2>
        </div>
        {!showForm && isAuthenticated && (
          <Button
            variant="secondary"
            onClick={() => setShowForm(true)}
          >
            Write Review
          </Button>
        )}
      </div>

      {showForm ? (
        <ReviewForm
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
          isLoading={isSubmitting}
        />
      ) : (
        <ReviewList reviews={reviews} />
      )}
    </div>
  );
}