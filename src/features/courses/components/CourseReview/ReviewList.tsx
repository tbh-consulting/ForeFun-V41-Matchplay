import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Star } from 'lucide-react';
import { CourseReview } from '../../types';

interface ReviewListProps {
  reviews: CourseReview[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No reviews yet. Be the first to review this course!
      </div>
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
          <div className="flex items-center space-x-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= review.rating
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          {review.comment && (
            <p className="text-gray-600">{review.comment}</p>
          )}
        </div>
      ))}
    </div>
  );
}