import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useScorecardHistory } from '../hooks/useScorecardHistory';
import { Loader, Trophy } from 'lucide-react';

interface ScorecardHistoryProps {
  userId?: string;
}

export function ScorecardHistory({ userId }: ScorecardHistoryProps) {
  const navigate = useNavigate();
  const { scorecards, isLoading } = useScorecardHistory(userId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (scorecards.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-gray-500">No scorecards found</p>
      </div>
    );
  }

  const formatRelativeScore = (score: number | null) => {
    if (score === null) return '-';
    if (score === 0) return 'E';
    return score > 0 ? `+${score}` : score.toString();
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-500';
    if (score === 0) return 'text-gray-900';
    return score > 0 ? 'text-red-600' : 'text-green-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium text-gray-900">Scorecard History</h3>
      </div>
      <div className="border-t border-gray-200 divide-y divide-gray-200">
        {scorecards.map((scorecard) => (
          <div
            key={scorecard.id}
            className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => navigate(`/scorecards/${scorecard.id}`)}
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {scorecard.courseName}
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  {format(new Date(scorecard.date), 'MMMM d, yyyy')}
                </p>
              </div>
              <div className="ml-6 flex flex-col items-end gap-1">
                <span className={`text-sm font-medium ${getScoreColor(scorecard.relativeScore)}`}>
                  {formatRelativeScore(scorecard.relativeScore)}
                </span>
                {scorecard.totalPoints > 0 && (
                  <div className="flex items-center gap-1 text-sm text-accent">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>{scorecard.totalPoints} pts</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}