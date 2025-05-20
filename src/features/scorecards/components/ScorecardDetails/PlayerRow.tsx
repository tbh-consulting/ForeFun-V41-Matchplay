import React from 'react';
import { PlayerInitials } from './PlayerInitials';
import { ScorecardPlayer } from '../../types';
import { CourseHole } from '@/features/courses/types';
import { HandicapSection } from './HandicapSection';
import { ScoreSection } from './ScoreSection';
import { Users } from 'lucide-react';

interface PlayerRowProps {
  player: ScorecardPlayer & { isTeam?: boolean };
  holes: CourseHole[];
  scores: Record<number, { gross: number | null; points: number | null; matchPlayStatus?: number }>;
  onScoreChange: (holeNumber: number, score: number) => void;
  isDisabled: boolean;
  isTeam?: boolean;
  isTeamGame?: boolean;
}

export function PlayerRow({ player, holes, scores, onScoreChange, isDisabled, isTeam, isTeamGame }: PlayerRowProps) {
  if (!player) return null;

  return (
    <>
      {/* Player/Team Info */}
      <tr className="border-t border-gray-200">
        <td className="p-2" colSpan={holes.length + 2}>
          <div className="flex items-center gap-2">
            {isTeam ? (
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-accent" />
              </div>
            ) : (
              <PlayerInitials username={player.username} size="sm" />
            )}
            <div className="font-medium">
              {player.username}
              {player.handicap != null && (
                <span className="text-gray-500 text-sm">
                  {' '}({player.handicap})
                </span>
              )}
            </div>
          </div>
        </td>
      </tr>

      {/* Handicap Strokes */}
      <HandicapSection 
        holes={holes} 
        playerHandicap={player.handicap} 
      />

      {/* Scores */}
      <ScoreSection
        holes={holes}
        scores={scores}
        onScoreChange={onScoreChange}
        isDisabled={isDisabled}
        isTeamGame={isTeamGame}
      />
    </>
  );
}