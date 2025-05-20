import React from 'react';

interface PlayerInitialsProps {
  username?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

export function PlayerInitials({ username, size = 'md' }: PlayerInitialsProps) {
  const getInitials = (name: string | null | undefined): string => {
    if (!name) return '??';
    
    const parts = name.split(/[\s._-]/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  return (
    <div 
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center
        rounded-full bg-accent text-white
        font-medium
      `}
    >
      {getInitials(username)}
    </div>
  );
}