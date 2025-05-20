import React from 'react';
import { Users, User } from 'lucide-react';
import { GameType } from '../../types';

interface GameTypeDisplayProps {
  gameType?: GameType | string;
  size?: 'sm' | 'md' | 'lg';
}

export function GameTypeDisplay({ gameType, size = 'md' }: GameTypeDisplayProps) {
  // Define game type information
  const gameTypeInfo: Record<string, {
    label: string;
    icon: React.ReactNode;
    color: string;
  }> = {
    'strokeplay': {
      label: 'Stroke Play',
      icon: <User className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />,
      color: 'bg-blue-50 text-blue-600'
    },
    'scramble': {
      label: 'Scramble',
      icon: <Users className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />,
      color: 'bg-green-50 text-green-600'
    }
  };

  // Return null if the game type is not recognized or undefined
  if (!gameType || !gameTypeInfo[gameType]) {
    return null;
  }

  const { label, icon, color } = gameTypeInfo[gameType];

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs sm:text-sm',
    lg: 'px-3 py-1.5 text-sm'
  };

  return (
    <div className={`inline-flex items-center gap-1 rounded-full ${color} ${sizeClasses[size]}`}>
      {icon}
      <span className="font-medium">{label}</span>
    </div>
  );
}