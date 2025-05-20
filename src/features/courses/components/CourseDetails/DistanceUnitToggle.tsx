import React from 'react';

interface DistanceUnitToggleProps {
  unit: 'meters' | 'yards';
  onChange: (unit: 'meters' | 'yards') => void;
}

export function DistanceUnitToggle({ unit, onChange }: DistanceUnitToggleProps) {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">Distance:</span>
      <div className="flex rounded-lg overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => onChange('meters')}
          className={`
            px-3 py-1 text-sm font-medium transition-colors
            ${unit === 'meters'
              ? 'bg-accent text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
            }
            border-y border-l border-gray-200
            rounded-l-lg
          `}
        >
          Meters
        </button>
        <button
          type="button"
          onClick={() => onChange('yards')}
          className={`
            px-3 py-1 text-sm font-medium transition-colors
            ${unit === 'yards'
              ? 'bg-accent text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
            }
            border border-gray-200
            rounded-r-lg
            ${unit === 'yards' ? 'border-accent' : ''}
          `}
        >
          Yards
        </button>
      </div>
    </div>
  );
}