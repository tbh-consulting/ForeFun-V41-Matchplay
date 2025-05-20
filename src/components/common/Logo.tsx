import React from 'react';
import { Circle, Flag } from 'lucide-react';

export function Logo() {
  return (
    <div className="relative w-8 h-8 flex items-center justify-center transition-transform duration-DEFAULT hover:scale-105">
      {/* Golf ball */}
      <Circle 
        className="h-6 w-6 text-accent absolute" 
        fill="white"
        strokeWidth={2}
      />
      {/* Flag */}
      <Flag 
        className="h-5 w-5 text-accent absolute -top-1 -right-1" 
        strokeWidth={2.5}
      />
    </div>
  );
}