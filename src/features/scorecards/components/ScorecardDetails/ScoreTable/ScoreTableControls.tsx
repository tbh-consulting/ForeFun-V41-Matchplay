import React from 'react';
import { TeeSelector } from '../TeeSelector';
import { DistanceUnitToggle } from '../DistanceUnitToggle';

interface ScoreTableControlsProps {
  selectedTee: 'black' | 'white' | 'yellow' | 'blue' | 'red';
  onTeeChange: (tee: 'black' | 'white' | 'yellow' | 'blue' | 'red') => void;
  distanceUnit: 'meters' | 'yards';
  onDistanceUnitChange: (unit: 'meters' | 'yards') => void;
}

export function ScoreTableControls({
  selectedTee,
  onTeeChange,
  distanceUnit,
  onDistanceUnitChange
}: ScoreTableControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-4 bg-white p-4 rounded-lg shadow-sm">
      <TeeSelector selectedTee={selectedTee} onChange={onTeeChange} />
      <DistanceUnitToggle unit={distanceUnit} onChange={onDistanceUnitChange} />
    </div>
  );
}