import React from 'react';
import { CourseHole } from '@/features/courses/types';
import { metersToYards } from '../../utils/distanceConversion';

interface TeeDistanceRowProps {
  holes: CourseHole[];
  selectedTee: 'black' | 'white' | 'yellow' | 'blue' | 'red';
  unit: 'meters' | 'yards';
}

export function TeeDistanceRow({ holes, selectedTee, unit }: TeeDistanceRowProps) {
  const getDistance = (hole: CourseHole): number | null => {
    const key = `distance${selectedTee.charAt(0).toUpperCase() + selectedTee.slice(1)}Meters` as keyof CourseHole;
    const distance = hole[key] as number | null;
    
    if (distance === null) return null;
    return unit === 'meters' ? distance : metersToYards(distance);
  };

  return (
    <tr className="bg-gray-50">
      <td className="p-2 font-medium text-gray-600">Distance</td>
      {holes.map((hole) => {
        const distance = getDistance(hole);
        return (
          <td key={hole.id} className="p-2 text-center">
            {distance !== null ? `${distance} ${unit}` : '-'}
          </td>
        );
      })}
      <td className="p-2" />
    </tr>
  );
}