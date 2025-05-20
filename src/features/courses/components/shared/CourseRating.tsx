import React from 'react';
import { Star, StarHalf } from 'lucide-react';
import { useCourseRating } from '../../hooks/useCourseRating';

interface CourseRatingProps {
  courseId: string;
  showCount?: boolean;
  className?: string;
}

export function CourseRating({ courseId, showCount = false, className = '' }: CourseRatingProps) {
  const { averageRating, totalReviews, isLoading } = useCourseRating(courseId);

  if (isLoading) {
    return <div className="animate-pulse h-4 w-24 bg-gray-200 rounded" />;
  }

  const fullStars = Math.floor(averageRating);
  const hasHalfStar = averageRating % 1 >= 0.5;

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <Star
            key={`full-${i}`}
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 fill-current"
          />
        ))}
        {hasHalfStar && (
          <StarHalf className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
        )}
        {[...Array(5 - Math.ceil(averageRating))].map((_, i) => (
          <Star
            key={`empty-${i}`}
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-300"
          />
        ))}
      </div>
      {showCount && (
        <span className="ml-1 sm:ml-2 text-xs sm:text-sm text-gray-600">
          ({totalReviews})
        </span>
      )}
    </div>
  );
}