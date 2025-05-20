import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';

interface ReviewFormProps {
  onSubmit: (rating: number, comment: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ReviewForm({ onSubmit, onCancel, isLoading }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    await onSubmit(rating, comment);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Rating
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoveredRating(value)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-1 -m-1 rounded-full transition-colors hover:bg-gray-50"
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  value <= (hoveredRating || rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        {rating === 0 && (
          <p className="text-sm text-gray-500">Please select a rating</p>
        )}
      </div>

      <Input
        label="Your Review"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience with this course..."
      />

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={rating === 0}
        >
          Submit Review
        </Button>
      </div>
    </form>
  );
}