import React from 'react';
import { CourseHole } from '@/features/courses/types';

interface HoleInfoProps {
  hole: CourseHole;
  distanceUnit: 'meters' | 'yards';
  selectedTee: 'black' | 'white' | 'yellow' | 'blue' | 'red';
}

export function HoleInfo({ hole, distanceUnit, selectedTee }: HoleInfoProps) {
  const getDistance = () => {
    const key = `distance${selectedTee.charAt(0).toUpperCase() + selectedTee.slice(1)}${
      distanceUnit.charAt(0).toUpperCase() + distanceUnit.slice(1)
    }` as keyof CourseHole;
    return hole[key] || '-';
  };

  return (
    <div className="text-center space-y-1">
      <div className="font-bold text-gray-900">{hole.holeNumber}</div>
      <div className="text-sm text-gray-600">Par {hole.par}</div>
      <div className="text-xs text-gray-500">SI {hole.handicap || '-'}</div>
      <div className="text-xs text-gray-500">{getDistance()} {distanceUnit}</div>
    </div>
  );
}