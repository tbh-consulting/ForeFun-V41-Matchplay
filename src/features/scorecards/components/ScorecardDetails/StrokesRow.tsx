import React from 'react';
import { ScorecardPlayer } from '../../types';
import { CourseHole } from '@/features/courses/types';

interface StrokesRowProps {
  player: ScorecardPlayer;
  holes: CourseHole[];
  scores: Record<number, number>;
}

export function StrokesRow({ player, holes, scores }: StrokesRowProps) {
  // Calculate handicap strokes based on player's handicap and hole SI
  const getHandicapStrokes = (holeHandicap: number | null) => {
    if (!player.handicap || !holeHandicap) return 0;
    return Math.floor((player.handicap / 18) + (player.handicap >= holeHandicap ? 1 : 0));
  };

  return (
    <tr className="bg-gray-50 border-b border-gray-200">
      <td className="p-3 text-left font-medium text-gray-500">
        Strokes
      </td>
      {holes.map((hole) => {
        const handicapStrokes = getHandicapStrokes(hole.handicap);
        return (
          <td key={`strokes-${hole.id}`} className="p-3 text-center">
            {handicapStrokes > 0 && (
              <div className="text-accent text-xs font-medium">
                {'•'.repeat(Math.min(handicapStrokes, 3))}
                {handicapStrokes > 3 && ` (${handicapStrokes})`}
              </div>
            )}
          </td>
        );
      })}
      <td className="p-3" />
    </tr>
  );
}