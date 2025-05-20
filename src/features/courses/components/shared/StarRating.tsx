import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  className?: string;
}

export function StarRating({ 
  value, 
  onChange,
  size = 'md',
  interactive = true,
  className = ''
}: StarRatingProps) {
  const [hoveredRating, setHoveredRating] = React.useState(0);

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleClick = (rating: number) => {
    if (!interactive) return;
    // Toggle rating if clicking the same star
    onChange(rating === value ? 0 : rating);
  };

  return (
    <div className={`flex gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => handleClick(rating)}
          onMouseEnter={() => interactive && setHoveredRating(rating)}
          onMouseLeave={() => interactive && setHoveredRating(0)}
          className={`
            p-1 -m-1 rounded-full transition-colors
            ${interactive ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'}
          `}
          disabled={!interactive}
          aria-label={`Rate ${rating} stars`}
        >
          <Star
            className={`
              ${sizes[size]}
              transition-colors duration-200
              ${rating <= (hoveredRating || value)
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
              }
            `}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}