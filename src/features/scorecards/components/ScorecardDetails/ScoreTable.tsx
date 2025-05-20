import React, { useState } from 'react';
import { HoleRow } from './HoleRow';
import { PlayerRow } from './PlayerRow';
import { TeeDistanceRow } from './TeeDistanceRow';
import { TeeSelector } from './TeeSelector';
import { DistanceUnitToggle } from './DistanceUnitToggle';
import { CourseHole } from '@/features/courses/types';
import { ScorecardPlayer } from '../../types';

interface ScoreTableProps {
  title: string;
  holes: CourseHole[];
  players: (ScorecardPlayer & { isTeam?: boolean })[];
  scores: Record<string, Record<number, { gross: number | null; points: number | null; matchPlayStatus?: number }>>;
  onScoreChange: (playerId: string, holeNumber: number, score: number) => void;
  isCreator: boolean;
  isCompleted: boolean;
  currentPlayerId?: string;
  isTeamGame?: boolean;
}

export function ScoreTable({
  title,
  holes,
  players,
  scores,
  onScoreChange,
  isCreator,
  isCompleted,
  currentPlayerId,
  isTeamGame = false
}: ScoreTableProps) {
  const [selectedTee, setSelectedTee] = useState<'black' | 'white' | 'yellow' | 'blue' | 'red'>('white');
  const [distanceUnit, setDistanceUnit] = useState<'meters' | 'yards'>('meters');

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex flex-wrap items-center gap-4">
          <TeeSelector selectedTee={selectedTee} onChange={setSelectedTee} />
          <DistanceUnitToggle unit={distanceUnit} onChange={setDistanceUnit} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="p-2 text-left rounded-tl-lg">Hole</th>
              {holes.map((hole) => (
                <th key={`header-${hole.id}`} className="p-2 text-center w-12">
                  {hole.holeNumber}
                </th>
              ))}
              <th className="p-2 text-center rounded-tr-lg">Total</th>
            </tr>
          </thead>
          <tbody>
            {/* Par Row */}
            <HoleRow
              label="Par"
              holes={holes}
              getValue={(hole) => hole.par}
              className="bg-gray-50"
              showTotal
            />
            
            {/* S.I. Row */}
            <HoleRow
              label="S.I."
              holes={holes}
              getValue={(hole) => hole.handicap || '-'}
              className="bg-gray-50"
            />

            {/* Distance Row */}
            <TeeDistanceRow
              holes={holes}
              selectedTee={selectedTee}
              unit={distanceUnit}
            />

            {/* Player/Team Rows */}
            {players.map((player) => (
              <PlayerRow
                key={`player-${player.id}`}
                player={player}
                holes={holes}
                scores={scores[player.id] || {}}
                onScoreChange={(holeNumber, score) => 
                  onScoreChange(player.id, holeNumber, score)
                }
                isDisabled={isCompleted || (!isCreator && player.id !== currentPlayerId)}
                isTeam={player.isTeam}
                isTeamGame={isTeamGame}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}