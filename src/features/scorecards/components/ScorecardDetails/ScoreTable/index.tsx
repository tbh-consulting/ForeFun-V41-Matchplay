import React, { useState } from 'react';
import { CourseHole } from '@/features/courses/types';
import { ScorecardPlayer } from '../../../types';
import { ScoreTableHeader } from './ScoreTableHeader';
import { ScoreTableControls } from './ScoreTableControls';
import { ScoreTableRow } from './ScoreTableRow';

interface ScoreTableProps {
  title: string;
  holes: CourseHole[];
  players: ScorecardPlayer[];
  scores: Record<string, Record<number, { gross: number; points: number }>>;
  onScoreChange: (playerId: string, holeNumber: number, score: number) => void;
  isCreator: boolean;
  isCompleted: boolean;
  currentPlayerId?: string;
}

export function ScoreTable({
  title,
  holes,
  players,
  scores,
  onScoreChange,
  isCreator,
  isCompleted,
  currentPlayerId
}: ScoreTableProps) {
  const [selectedTee, setSelectedTee] = useState<'black' | 'white' | 'yellow' | 'blue' | 'red'>('white');
  const [distanceUnit, setDistanceUnit] = useState<'meters' | 'yards'>('meters');

  const getDistance = (hole: CourseHole) => {
    const key = `distance${selectedTee.charAt(0).toUpperCase() + selectedTee.slice(1)}${
      distanceUnit.charAt(0).toUpperCase() + distanceUnit.slice(1)
    }` as keyof CourseHole;
    return hole[key] || '-';
  };

  const holeNumbers = holes.map(h => h.holeNumber);
  const pars = holes.map(h => h.par);
  const handicaps = holes.map(h => h.handicap || null);
  const distances = holes.map(h => getDistance(h));

  return (
    <div className="w-full">
      {/* Title and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center gap-4">
          <TeeSelector selectedTee={selectedTee} onChange={setSelectedTee} />
          <DistanceUnitToggle unit={distanceUnit} onChange={setDistanceUnit} />
        </div>
      </div>

      {/* Score Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <ScoreTableHeader holes={holeNumbers} />
          </thead>
          <tbody>
            <ScoreTableRow label="Par" values={pars} total={pars.reduce((a, b) => a + b, 0)} />
            <ScoreTableRow label="S.I." values={handicaps} />
            <ScoreTableRow 
              label="Distance" 
              values={distances.map(d => `${d} ${distanceUnit}`)} 
            />

            {players.map((player) => {
              const playerScores = scores[player.id] || {};
              const isDisabled = isCompleted || (!isCreator && player.id !== currentPlayerId);
              const grossScores = holeNumbers.map(h => playerScores[h]?.gross || null);
              const handicapStrokes = holeNumbers.map(h => playerScores[h]?.handicapStrokes || 0);

              return (
                <ScoreTableRow
                  key={player.id}
                  label={player.username}
                  values={grossScores}
                  total={grossScores.reduce((a, b) => a + (b || 0), 0)}
                  showHandicapStrokes
                  handicapStrokes={handicapStrokes}
                  onScoreChange={(index, value) => 
                    onScoreChange(player.id, holeNumbers[index], value)
                  }
                  isDisabled={isDisabled}
                  par={pars}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}