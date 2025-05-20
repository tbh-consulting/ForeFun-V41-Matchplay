import React from 'react';
import { Dog } from 'lucide-react';
import { Button } from '@/components/shared/Button';

interface DogPolicyFilterProps {
  showDogFriendly: boolean;
  onChange: (value: boolean) => void;
}

export function DogPolicyFilter({ showDogFriendly, onChange }: DogPolicyFilterProps) {
  return (
    <Button
      variant={showDogFriendly ? 'primary' : 'secondary'}
      onClick={() => onChange(!showDogFriendly)}
      className="flex items-center gap-1 !py-1 sm:!py-1.5 !px-2 sm:!px-3 text-xs sm:text-sm"
    >
      <Dog className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      <span>Accept Dog</span>
    </Button>
  );
}