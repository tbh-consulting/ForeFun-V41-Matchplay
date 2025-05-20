import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { ReviewForm } from './ReviewForm';
import { ReviewList } from './ReviewList';
import { useReviews } from '../../hooks/useReviews';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface ReviewSectionProps {
  courseId: string;
}

export function ReviewSection({ courseId }: ReviewSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { reviews, isLoading, isSubmitting, addReview } = useReviews(courseId);

  const handleSubmit = async (rating: number, comment: string) => {
    const success = await addReview(rating, comment);
    if (success) {
      setShowForm(false);
    }
  };

  const handleWriteReview = () => {
    if (!isAuthenticated) {
      // Save current location for redirect after login
      navigate('/login', { 
        state: { from: window.location.pathname }
      });
      return;
    }
    setShowForm(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-gray-900">Reviews</h2>
        </div>
        {!showForm && (
          <Button
            variant="secondary"
            onClick={handleWriteReview}
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
        <ReviewList reviews={reviews} isLoading={isLoading} />
      )}
    </div>
  );
}