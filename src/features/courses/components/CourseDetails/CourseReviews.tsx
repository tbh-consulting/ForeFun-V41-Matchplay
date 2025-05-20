import React, { useState } from 'react';
import { MessageSquare, Star } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { CourseRating } from '../shared/CourseRating';
import { CourseReview } from '../../types';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { formatReviewDate } from '../../utils/dateUtils';

interface CourseReviewsProps {
  reviews?: CourseReview[];
  courseId: string;
}

export function CourseReviews({ reviews = [], courseId }: CourseReviewsProps) {
  const { isAuthenticated } = useAuth();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-gray-900">Reviews</h2>
        </div>
        {isAuthenticated && !showForm && (
          <Button
            variant="secondary"
            onClick={() => setShowForm(true)}
          >
            Write Review
          </Button>
        )}
      </div>

      {showForm && (
        <form className="mb-6 space-y-4">
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                className="text-gray-300 hover:text-yellow-400"
              >
                <Star className="w-6 h-6" />
              </button>
            ))}
          </div>
          <Input
            label="Your review"
            placeholder="Share your experience..."
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Submit Review
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <img
                  src={review.user?.avatarUrl || 'https://via.placeholder.com/32'}
                  alt={review.user?.username}
                  className="w-8 h-8 rounded-full"
                />
                <span className="font-medium text-gray-900">
                  {review.user?.username}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {formatReviewDate(review.createdAt)}
              </span>
            </div>
            <CourseRating rating={review.rating} />
            {review.comment && (
              <p className="mt-2 text-gray-600">{review.comment}</p>
            )}
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            No reviews yet. Be the first to review this course!
          </p>
        )}
      </div>
    </div>
  );
}