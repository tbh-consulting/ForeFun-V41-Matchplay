import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { CourseReview } from '../../types';
import { StarRating } from '../shared/StarRating';

interface ReviewListProps {
  reviews: CourseReview[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <p className="text-center text-gray-500 py-4">
        No reviews yet. Be the first to review this course!
      </p>
    );
  }

  return (
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
              {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <StarRating value={review.rating} onChange={() => {}} interactive={false} />
          </div>
          {review.comment && (
            <p className="mt-2 text-gray-600">{review.comment}</p>
          )}
        </div>
      ))}
    </div>
  );
}