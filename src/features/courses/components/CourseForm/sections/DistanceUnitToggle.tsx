import React from 'react';

interface DistanceUnitToggleProps {
  unit: 'yards' | 'meters';
  onChange: (unit: 'yards' | 'meters') => void;
}

export function DistanceUnitToggle({ unit, onChange }: DistanceUnitToggleProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <span className="font-medium text-gray-900">Distance Unit</span>
        <div className="flex rounded-lg overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => onChange('yards')}
            className={`
              px-6 py-2.5 text-sm font-medium transition-colors
              ${unit === 'yards'
                ? 'bg-accent text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
              }
              border-y border-l border-gray-200
              rounded-l-lg
            `}
          >
            Yards
          </button>
          <button
            type="button"
            onClick={() => onChange('meters')}
            className={`
              px-6 py-2.5 text-sm font-medium transition-colors
              ${unit === 'meters'
                ? 'bg-accent text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
              }
              border border-gray-200
              rounded-r-lg
              ${unit === 'meters' ? 'border-accent' : ''}
            `}
          >
            Meters
          </button>
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-500">
        All distances will be automatically converted when changing units
      </p>
    </div>
  );
}