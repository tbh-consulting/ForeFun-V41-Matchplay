import React from 'react';

interface TeeSelectorProps {
  selectedTee: 'black' | 'white' | 'yellow' | 'blue' | 'red';
  onChange: (tee: 'black' | 'white' | 'yellow' | 'blue' | 'red') => void;
}

export function TeeSelector({ selectedTee, onChange }: TeeSelectorProps) {
  const tees = [
    { value: 'black', label: 'Black', color: 'bg-gray-900' },
    { value: 'white', label: 'White', color: 'bg-white border' },
    { value: 'yellow', label: 'Yellow', color: 'bg-yellow-400' },
    { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
    { value: 'red', label: 'Red', color: 'bg-red-500' }
  ] as const;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700">Tee:</span>
      <div className="flex gap-2">
        {tees.map(({ value, label, color }) => (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={`
              w-6 h-6 rounded-full flex items-center justify-center
              ${color}
              ${selectedTee === value ? 'ring-2 ring-accent ring-offset-2' : ''}
              transition-all duration-200
            `}
            title={`${label} tees`}
          />
        ))}
      </div>
    </div>
  );
}