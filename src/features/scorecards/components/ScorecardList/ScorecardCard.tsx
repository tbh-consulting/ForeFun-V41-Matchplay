import React from 'react';
import { MapPin, Clock, Trophy, Users } from 'lucide-react';
import { format } from 'date-fns';
import { Scorecard } from '../../types';
import { GameTypeDisplay } from '../ScorecardDetails/GameTypeDisplay';

interface ScorecardCardProps {
  scorecard: Scorecard;
  onClick: () => void;
}

export function ScorecardCard({ scorecard, onClick }: ScorecardCardProps) {
  const formatRelativeScore = (score: number | null | undefined) => {
    if (score === null || score === undefined) return '-';
    if (score === 0) return 'E';
    return score > 0 ? `+${score}` : score.toString();
  };

  const getScoreColor = (score: number | null | undefined) => {
    if (score === null || score === undefined) return 'text-gray-500';
    if (score === 0) return 'text-gray-900';
    return score > 0 ? 'text-red-600' : 'text-green-600';
  };

  const formatMatchPlayScore = (score: number | null | undefined) => {
    if (score === null || score === undefined) return null;
    if (score === 0) return 'AS';
    
    if (score > 0) {
      return score === 1 ? "1U" : `${score}U`;
    } else {
      const absValue = Math.abs(score);
      return absValue === 1 ? "1D" : `${absValue}D`;
    }
  };

  const isTeamGame = scorecard.gameType === 'scramble' || scorecard.gameType === '4ball';
  const hasMatchPlayScore = isTeamGame && scorecard.userTeam && 
                           scorecard.userTeam.matchPlayTotal !== undefined;

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
    >
      <div className="p-3 sm:p-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-1 mb-2 sm:mb-3">
          {scorecard.courseName}
        </h3>
        
        <div className="space-y-2">
          <div className="flex items-center text-gray-600">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">
              {format(new Date(scorecard.date), 'MMMM d, yyyy')}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
              <span className="text-xs sm:text-sm">
                {scorecard.players.length} {scorecard.players.length === 1 ? 'player' : 'players'}
              </span>
              <GameTypeDisplay gameType={scorecard.gameType} />
            </div>
            <div className="flex flex-col items-end gap-1">
              {hasMatchPlayScore ? (
                <span className={`text-sm sm:text-base font-medium ${
                  scorecard.userTeam.matchPlayTotal > 0 ? 'text-green-600' : 
                  scorecard.userTeam.matchPlayTotal < 0 ? 'text-red-600' : 
                  'text-gray-500'
                }`}>
                  {formatMatchPlayScore(scorecard.userTeam.matchPlayTotal)}
                </span>
              ) : (
                <span className={`text-sm sm:text-base font-medium ${getScoreColor(scorecard.userRelativeScore)}`}>
                  {formatRelativeScore(scorecard.userRelativeScore)}
                </span>
              )}
              {(scorecard.userPoints || 0) > 0 && (
                <div className="flex items-center gap-1 text-xs sm:text-sm text-blue-500">
                  <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>{scorecard.userPoints} pts</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Player/Team Avatars */}
        <div className="mt-3 sm:mt-4 flex -space-x-1 sm:-space-x-2">
          {isTeamGame && scorecard.teams ? (
            scorecard.teams.map((team, index) => (
              <div
                key={team.id}
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white bg-accent/10 flex items-center justify-center"
                style={{ zIndex: scorecard.teams!.length - index }}
              >
                <Users className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
              </div>
            ))
          ) : (
            scorecard.players.map((player, index) => (
              <img
                key={player.id}
                src={player.avatarUrl || 'https://via.placeholder.com/32'}
                alt={player.username}
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white"
                style={{ zIndex: scorecard.players.length - index }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}