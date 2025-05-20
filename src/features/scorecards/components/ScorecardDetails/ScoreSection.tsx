import React from 'react';
import { CourseHole } from '@/features/courses/types';
import { ScoreInput } from './ScoreInput';

interface ScoreSectionProps {
  holes: CourseHole[];
  scores: Record<number, { gross: number | null; points: number | null; matchPlayStatus?: number; handicapStrokes: number }>;
  onScoreChange: (holeNumber: number, score: number) => void;
  isDisabled: boolean;
  isTeamGame?: boolean;
}

export function ScoreSection({ holes, scores, onScoreChange, isDisabled, isTeamGame }: ScoreSectionProps) {
  // Calculate totals only for the current set of holes (front 9 or back 9)
  const currentHoleNumbers = holes.map(hole => hole.holeNumber);
  
  const totalScore = currentHoleNumbers.reduce((sum, holeNumber) => {
    const score = scores[holeNumber]?.gross;
    return score !== null ? sum + score : sum;
  }, 0);

  const totalPoints = currentHoleNumbers.reduce((sum, holeNumber) => {
    const points = scores[holeNumber]?.points;
    return points !== null ? sum + points : sum;
  }, 0);

  const totalMatchPlay = isTeamGame ? currentHoleNumbers.reduce((sum, holeNumber) => {
    const matchPlayStatus = scores[holeNumber]?.matchPlayStatus;
    return matchPlayStatus !== undefined ? sum + matchPlayStatus : sum;
  }, 0) : undefined;

  // Only show total if there are any scores in this section
  const hasAnyScores = currentHoleNumbers.some(holeNumber => scores[holeNumber]?.gross !== null);

  const getMatchPlayStatusDisplay = (status?: number) => {
    if (status === undefined || status === null) return null;
    if (status === 0) return <span className="text-xs text-gray-500">AS</span>;
    if (status > 0) return <span className="text-xs text-green-600">+{status}</span>;
    return <span className="text-xs text-red-600">{status}</span>;
  };

  return (
    <tr>
      <td className="p-2 font-medium text-gray-600">Score</td>
      {holes.map((hole) => {
        const score = scores[hole.holeNumber] || { gross: null, points: null, matchPlayStatus: undefined };
        return (
          <td key={hole.id} className="p-2 text-center">
            <div className="flex flex-col items-center gap-1">
              <ScoreInput
                value={score.gross}
                onChange={(value) => onScoreChange(hole.holeNumber, value)}
                disabled={isDisabled}
                par={hole.par}
              />
              <div className="flex flex-col items-center">
                {score.points !== null && (
                  <div className="text-xs font-medium text-accent">
                    {score.points} pts
                  </div>
                )}
                {isTeamGame && getMatchPlayStatusDisplay(score.matchPlayStatus)}
              </div>
            </div>
          </td>
        );
      })}
      <td className="p-2 text-center">
        <div className="flex flex-col items-center">
          <span className="font-bold">
            {hasAnyScores ? totalScore : '-'}
          </span>
          {totalPoints > 0 && (
            <span className="text-xs font-medium text-accent">
              {totalPoints} pts
            </span>
          )}
          {isTeamGame && totalMatchPlay !== undefined && (
            <span className={`text-xs font-medium ${
              totalMatchPlay > 0 ? 'text-green-600' : 
              totalMatchPlay < 0 ? 'text-red-600' : 
              'text-gray-500'
            }`}>
              {totalMatchPlay > 0 ? `+${totalMatchPlay}` : 
               totalMatchPlay < 0 ? totalMatchPlay : 
               'AS'}
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}