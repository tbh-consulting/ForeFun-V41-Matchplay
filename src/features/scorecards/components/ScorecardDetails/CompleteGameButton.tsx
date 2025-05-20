import React from 'react';
import { Button } from '@/components/shared/Button';

interface CompleteGameButtonProps {
  onComplete: () => void;
  isLoading?: boolean;
}

export function CompleteGameButton({ onComplete, isLoading }: CompleteGameButtonProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Game</h3>
      <p className="text-gray-600 mb-4">
        Once completed, scores will be locked and your stats will be updated.
      </p>
      <Button
        onClick={onComplete}
        isLoading={isLoading}
        className="w-full"
      >
        Complete Game
      </Button>
    </div>
  );
}