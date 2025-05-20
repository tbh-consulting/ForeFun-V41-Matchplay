import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { ScorecardCard } from './ScorecardCard';
import { EmptyState } from './EmptyState';
import { useScorecards } from '../../hooks/useScorecards';
import { ScorecardFilters } from '../../types/filters';

interface ScorecardListProps {
  filters: ScorecardFilters;
}

export function ScorecardList({ filters }: ScorecardListProps) {
  const navigate = useNavigate();
  const { scorecards, isLoading } = useScorecards(filters);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-3 sm:p-4 animate-pulse">
            <div className="h-5 sm:h-6 bg-gray-200 rounded w-3/4 mb-3 sm:mb-4" />
            <div className="space-y-2 sm:space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
            <div className="mt-3 sm:mt-4 flex -space-x-2">
              {[...Array(3)].map((_, j) => (
                <div
                  key={j}
                  className="w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-gray-200"
                  style={{ marginLeft: j > 0 ? '-8px' : '0' }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (scorecards.length === 0) {
    return <EmptyState onCreateNew={() => navigate('/scorecards/new')} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {scorecards.map((scorecard) => (
        <ScorecardCard
          key={scorecard.id}
          scorecard={scorecard}
          onClick={() => navigate(`/scorecards/${scorecard.id}`)}
        />
      ))}
    </div>
  );
}