import React from 'react';
import { CourseHole } from '@/features/courses/types';
import { metersToYards } from '../../utils/distanceConversion';

interface TeeDistanceDisplayProps {
  hole: CourseHole;
  selectedTee: 'black' | 'white' | 'yellow' | 'blue' | 'red';
  unit: 'meters' | 'yards';
}

export function TeeDistanceDisplay({ hole, selectedTee, unit }: TeeDistanceDisplayProps) {
  const getDistance = (hole: CourseHole): number | null => {
    const key = `distance${selectedTee.charAt(0).toUpperCase() + selectedTee.slice(1)}Meters` as keyof CourseHole;
    const distance = hole[key] as number | null;
    
    if (distance === null) return null;
    return unit === 'meters' ? distance : metersToYards(distance);
  };

  const distance = getDistance(hole);

  const teeColors = {
    black: 'bg-gray-900',
    white: 'bg-white border border-gray-300',
    yellow: 'bg-yellow-400',
    blue: 'bg-blue-500',
    red: 'bg-red-500'
  };

  return (
    <div className="text-sm text-gray-600 flex items-center justify-center gap-2">
      <div className={`w-2.5 h-2.5 rounded-full ${teeColors[selectedTee]}`} />
      <span>{distance !== null ? `${distance} ${unit}` : '-'}</span>
    </div>
  );
}