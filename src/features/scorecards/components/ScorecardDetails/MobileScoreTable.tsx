import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { PlayerInitials } from './PlayerInitials';
import { TeeSelector } from './TeeSelector';
import { DistanceUnitToggle } from './DistanceUnitToggle';
import { TeeDistanceDisplay } from './TeeDistanceDisplay';
import { ScoreInput } from './ScoreInput';
import { HandicapStrokesDisplay } from './HandicapStrokesDisplay';
import { CourseHole } from '@/features/courses/types';
import { ScorecardPlayer } from '../../types';

interface MobileScoreTableProps {
  holes: CourseHole[];
  players: (ScorecardPlayer & { isTeam?: boolean })[];
  scores: Record<string, Record<number, { 
    gross: number | null; 
    points: number | null;
    handicapStrokes: number;
  }>>;
  onScoreChange: (playerId: string, holeNumber: number, score: number) => void;
  isCreator: boolean;
  isCompleted: boolean;
  currentPlayerId?: string;
}

export function MobileScoreTable({
  holes,
  players,
  scores,
  onScoreChange,
  isCreator,
  isCompleted,
  currentPlayerId
}: MobileScoreTableProps) {
  const [selectedTee, setSelectedTee] = useState<'black' | 'white' | 'yellow' | 'blue' | 'red'>('white');
  const [distanceUnit, setDistanceUnit] = useState<'meters' | 'yards'>('meters');
  const [currentHoleIndex, setCurrentHoleIndex] = useState(0);

  const currentHole = holes[currentHoleIndex];
  const isFirstHole = currentHoleIndex === 0;
  const isLastHole = currentHoleIndex === holes.length - 1;

  const navigateHole = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && !isFirstHole) {
      setCurrentHoleIndex(prev => prev - 1);
    } else if (direction === 'next' && !isLastHole) {
      setCurrentHoleIndex(prev => prev + 1);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      {/* Settings */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <TeeSelector selectedTee={selectedTee} onChange={setSelectedTee} />
        <DistanceUnitToggle unit={distanceUnit} onChange={setDistanceUnit} />
      </div>

      {/* Hole Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateHole('prev')}
          disabled={isFirstHole}
          className="p-2 text-gray-400 hover:text-accent disabled:opacity-50"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-lg font-semibold text-gray-900">
          Hole {currentHole.holeNumber}
        </div>
        <button
          onClick={() => navigateHole('next')}
          disabled={isLastHole}
          className="p-2 text-gray-400 hover:text-accent disabled:opacity-50"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Current Hole Info */}
      <div className="grid grid-cols-3 gap-4 mb-6 text-center">
        <div>
          <div className="text-xs text-gray-600">Par</div>
          <div className="font-semibold">{currentHole.par}</div>
        </div>
        <div>
          <div className="text-xs text-gray-600">S.I.</div>
          <div className="font-semibold">{currentHole.handicap || '-'}</div>
        </div>
        <div>
          <TeeDistanceDisplay
            hole={currentHole}
            selectedTee={selectedTee}
            unit={distanceUnit}
          />
        </div>
      </div>

      {/* Player Scores */}
      <div className="space-y-4 mb-6">
        {players.map((player) => {
          const playerScores = scores[player.id] || {};
          const currentScore = playerScores[currentHole.holeNumber] || { 
            gross: null, 
            points: null, 
            handicapStrokes: 0 
          };
          const isDisabled = isCompleted || (!isCreator && player.id !== currentPlayerId);

          return (
            <div key={player.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {player.isTeam ? (
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-accent" />
                    </div>
                  ) : (
                    <PlayerInitials username={player.username} size="sm" />
                  )}
                  <div>
                    <div className="font-medium text-sm">{player.username}</div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-500">
                        HCP: {player.handicap !== undefined && player.handicap !== null ? player.handicap : 0}
                      </span>
                      {currentScore?.handicapStrokes !== undefined && (
                        <HandicapStrokesDisplay strokes={currentScore.handicapStrokes} />
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <ScoreInput
                    value={currentScore?.gross ?? null}
                    onChange={(value) => onScoreChange(player.id, currentHole.holeNumber, value)}
                    disabled={isDisabled}
                    par={currentHole.par}
                  />
                  {currentScore?.points !== null && currentScore?.points !== undefined && (
                    <span className="text-xs font-medium text-accent">
                      {currentScore.points} pts
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-1">
        {holes.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentHoleIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentHoleIndex
                ? 'bg-accent w-4'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}