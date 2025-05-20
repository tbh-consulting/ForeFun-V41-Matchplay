import React, { useState } from 'react';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { StarRating } from '../shared/StarRating';

interface ReviewFormProps {
  onSubmit: (rating: number, comment: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ReviewForm({ onSubmit, onCancel, isLoading }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    await onSubmit(rating, comment);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Rating Stars */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Rating
        </label>
        <StarRating value={rating} onChange={setRating} size="lg" />
        {rating === 0 && (
          <p className="text-sm text-gray-500">Select a rating</p>
        )}
      </div>

      {/* Comment */}
      <Input
        label="Your Review"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience..."
      />

      {/* Actions */}
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