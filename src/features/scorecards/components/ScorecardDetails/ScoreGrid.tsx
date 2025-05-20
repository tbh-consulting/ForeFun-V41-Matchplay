import React from 'react';
import { CourseHole } from '@/features/courses/types';
import { ScorecardPlayer } from '../../types';
import { ScoreTable } from './ScoreTable';
import { MobileScoreTable } from './MobileScoreTable';

interface ScoreGridProps {
  holes: CourseHole[];
  players: ScorecardPlayer[];
  scores: Record<string, Record<number, { gross: number; points: number }>>;
  onScoreChange: (playerId: string, holeNumber: number, score: number) => void;
  isCreator: boolean;
  isCompleted: boolean;
  currentPlayerId?: string;
}

export function ScoreGrid({
  holes,
  players,
  scores,
  onScoreChange,
  isCreator,
  isCompleted,
  currentPlayerId
}: ScoreGridProps) {
  // Split holes into front 9 and back 9
  const frontNine = holes.filter(h => h.holeNumber <= 9);
  const backNine = holes.filter(h => h.holeNumber > 9);

  return (
    <div className="w-full">
      {/* Desktop View */}
      <div className="hidden md:flex flex-col gap-8">
        {/* Front Nine */}
        <ScoreTable
          title="Front Nine"
          holes={frontNine}
          players={players}
          scores={scores}
          onScoreChange={onScoreChange}
          isCreator={isCreator}
          isCompleted={isCompleted}
          currentPlayerId={currentPlayerId}
        />

        {/* Back Nine */}
        {backNine.length > 0 && (
          <ScoreTable
            title="Back Nine"
            holes={backNine}
            players={players}
            scores={scores}
            onScoreChange={onScoreChange}
            isCreator={isCreator}
            isCompleted={isCompleted}
            currentPlayerId={currentPlayerId}
          />
        )}
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <MobileScoreTable
          holes={holes}
          players={players}
          scores={scores}
          onScoreChange={onScoreChange}
          isCreator={isCreator}
          isCompleted={isCompleted}
          currentPlayerId={currentPlayerId}
        />
      </div>
    </div>
  );
}