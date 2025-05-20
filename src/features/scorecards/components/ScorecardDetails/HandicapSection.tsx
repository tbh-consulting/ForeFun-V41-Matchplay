import React from 'react';
import { CourseHole } from '@/features/courses/types';

interface HandicapSectionProps {
  holes: CourseHole[];
  playerHandicap: number | null;
}

export function HandicapSection({ holes, playerHandicap }: HandicapSectionProps) {
  const getHandicapStrokes = (handicap: number | null, holeSI: number | null): number => {
    if (!handicap || !holeSI) return 0;
    
    // For handicaps 36 and above, return 2 strokes
    if (handicap >= 36) return 2;

    // Calculate base strokes (1 stroke if handicap >= SI)
    const baseStrokes = handicap >= holeSI ? 1 : 0;

    // Calculate extra strokes for higher handicaps
    let extraStrokes = 0;
    if (handicap > 18) {
      const remainingHandicap = handicap - 18;
      if (holeSI <= remainingHandicap) {
        extraStrokes = 1;
      }
    }

    return baseStrokes + extraStrokes;
  };

  return (
    <tr className="bg-gray-50">
      <td className="p-2 font-medium text-gray-600">Strokes</td>
      {holes.map((hole) => {
        const strokes = getHandicapStrokes(playerHandicap, hole.handicap);
        return (
          <td key={hole.id} className="p-2 text-center">
            <div className="text-accent text-xs font-medium leading-none">
              {strokes > 0 && (
                <>
                  {'•'.repeat(Math.min(strokes, 3))}
                  {strokes > 3 && ` (${strokes})`}
                </>
              )}
            </div>
          </td>
        );
      })}
      <td className="p-2" />
    </tr>
  );
}