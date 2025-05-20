import React from 'react';
import { ClipboardList } from 'lucide-react';
import { Button } from '@/components/shared/Button';

interface EmptyStateProps {
  onCreateNew: () => void;
}

export function EmptyState({ onCreateNew }: EmptyStateProps) {
  return (
    <div className="text-center py-8 sm:py-12 px-4 bg-white rounded-lg shadow-sm">
      <ClipboardList className="w-10 h-10 sm:w-12 sm:h-12 text-accent mx-auto mb-3 sm:mb-4" />
      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
        No scorecards yet
      </h3>
      <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 max-w-md mx-auto">
        Start tracking your golf rounds by creating your first scorecard. You can record scores, track statistics, and share rounds with friends.
      </p>
      <Button 
        onClick={onCreateNew}
        className="!py-2 sm:!py-3 !px-4 sm:!px-6 text-sm sm:text-base"
      >
        Create First Scorecard
      </Button>
    </div>
  );
}