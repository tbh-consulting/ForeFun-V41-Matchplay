import React from 'react';
import { Plus, Minus } from 'lucide-react';

interface ScoreInputProps {
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
  par: number;
}

export function ScoreInput({ value, onChange, disabled, par }: ScoreInputProps) {
  const getScoreStyle = () => {
    if (value === null) return 'text-gray-500';
    if (value === 0) return 'text-gray-500'; // No special styling for zero
    
    const relativeToPar = value - par;
    switch (relativeToPar) {
      case -3:
        return 'bg-purple-600 text-white rounded-full';
      case -2:
        return 'bg-blue-600 text-white rounded-full';
      case -1:
        return 'text-blue-600 border-2 border-blue-600 rounded-full';
      case 0:
        return 'bg-green-600 text-white rounded-lg';
      case 1:
        return 'border-2 border-red-600 text-red-600 rounded-none';
      default:
        return relativeToPar > 1 
          ? 'bg-red-600 text-white rounded-none' 
          : 'text-gray-500';
    }
  };

  const handleIncrement = () => {
    if (disabled) return;
    onChange(value ? value + 1 : par);
  };

  const handleDecrement = () => {
    if (disabled || !value) return;
    onChange(Math.max(1, value - 1));
  };

  const handleClick = () => {
    if (!disabled && value === null) {
      onChange(par);
    }
  };

  return (
    <div className="inline-flex flex-col items-center gap-0.5">
      <button
        onClick={handleIncrement}
        disabled={disabled}
        className="md:p-0.5 p-1 text-gray-400 hover:text-accent disabled:opacity-50 disabled:hover:text-gray-400 md:bg-transparent bg-gray-200 rounded-full md:hover:bg-transparent hover:bg-gray-300 transition-colors md:scale-100 scale-120"
        aria-label="Increase score"
        type="button"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={handleClick}
        disabled={disabled}
        className={`
          w-7 h-7 text-center font-medium text-lg leading-none
          flex items-center justify-center transition-all
          ${getScoreStyle()}
          ${!disabled && value === null ? 'hover:text-accent cursor-pointer' : ''}
          disabled:cursor-not-allowed
        `}
        type="button"
      >
        {value === null ? '-' : value}
      </button>

      <button
        onClick={handleDecrement}
        disabled={disabled || !value}
        className="md:p-0.5 p-1 text-gray-400 hover:text-accent disabled:opacity-50 disabled:hover:text-gray-400 md:bg-transparent bg-gray-200 rounded-full md:hover:bg-transparent hover:bg-gray-300 transition-colors md:scale-100 scale-120"
        aria-label="Decrease score"
        type="button"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}