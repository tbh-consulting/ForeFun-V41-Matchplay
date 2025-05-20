import React from 'react';
import { CourseHole } from '@/features/courses/types';

interface HoleRowProps {
  label: string;
  holes: CourseHole[];
  getValue: (hole: CourseHole) => string | number;
  className?: string;
  showTotal?: boolean;
}

export function HoleRow({ 
  label, 
  holes, 
  getValue, 
  className = '', 
  showTotal = false 
}: HoleRowProps) {
  const total = showTotal 
    ? holes.reduce((sum, hole) => sum + (Number(getValue(hole)) || 0), 0)
    : null;

  return (
    <tr className={className}>
      <td className="p-2 font-medium">{label}</td>
      {holes.map((hole) => (
        <td key={hole.id} className="p-2 text-center">
          {getValue(hole)}
        </td>
      ))}
      {showTotal ? (
        <td className="p-2 text-center font-bold">{total}</td>
      ) : (
        <td className="p-2" />
      )}
    </tr>
  );
}