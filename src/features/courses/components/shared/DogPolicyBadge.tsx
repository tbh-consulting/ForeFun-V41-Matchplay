import React from 'react';
import { Dog, Ban, HelpCircle } from 'lucide-react';
import { DogPolicy } from '../../types';

interface DogPolicyBadgeProps {
  policy: DogPolicy;
  className?: string;
  size?: 'sm' | 'md';
}

export function DogPolicyBadge({ policy, className = '', size = 'sm' }: DogPolicyBadgeProps) {
  const variants = {
    yes: 'bg-green-50 text-green-700 border-green-200',
    no: 'bg-red-50 text-red-700 border-red-200',
    na: 'bg-gray-50 text-gray-700 border-gray-200'
  };

  const labels = {
    yes: 'Dogs Welcome',
    no: 'No Dogs Allowed',
    na: 'Dog Policy Unknown'
  };

  const icons = {
    yes: Dog,
    no: Ban,
    na: HelpCircle
  };

  const Icon = icons[policy];
  const sizes = {
    sm: 'text-[10px] py-0.5 px-1.5 sm:text-xs sm:py-1 sm:px-2.5',
    md: 'text-xs py-1 px-2 sm:text-sm sm:py-1.5 sm:px-3'
  };

  return (
    <div 
      className={`
        inline-flex items-center rounded-full font-medium border
        ${variants[policy]} ${sizes[size]} ${className}
      `}
      title={labels[policy]}
    >
      <Icon className={`${size === 'sm' ? 'w-3 h-3 sm:w-3.5 sm:h-3.5' : 'w-3.5 h-3.5 sm:w-4 sm:h-4'} mr-1`} />
      {labels[policy]}
    </div>
  );
}