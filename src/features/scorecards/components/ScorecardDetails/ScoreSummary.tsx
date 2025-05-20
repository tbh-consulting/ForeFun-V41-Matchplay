import React from 'react';
import { calculateTotalScore, calculateNetTotal, formatNetScore } from '../../utils/scoreCalculations';
import { CourseHole } from '@/features/courses/types';

interface ScoreSummaryProps {
  scores: Record<number, number>;
  holes: CourseHole[];
  playerHandicap?: number;
}

export function ScoreSummary({ scores, holes, playerHandicap }: ScoreSummaryProps) {
  const totalScore = calculateTotalScore(scores);
  const netTotal = calculateNetTotal(scores, holes);
  
  return (
    <div className="text-center">
      <div className="font-bold text-lg">{totalScore}</div>
      <div className="text-sm text-gray-500 space-x-2">
        <span>Net: {formatNetScore(netTotal)}</span>
        {playerHandicap && <span>• HCP: {playerHandicap}</span>}
      </div>
    </div>
  );
}