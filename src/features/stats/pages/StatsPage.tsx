import React from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { StatsOverview } from '../components/StatsOverview';
import { ScorecardHistory } from '../components/ScorecardHistory';
import { ScoreChart } from '../components/ScoreChart';
import { AdvancedStats } from '../components/AdvancedStats';
import { ConnectionRequired } from '@/components/shared/ConnectionRequired';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Loader } from 'lucide-react';
import { useScoreHistory } from '../hooks/useScoreHistory';

export function StatsPage() {
  const { user } = useAuth();
  const { scores, isLoading: isLoadingScores } = useScoreHistory(user?.id);

  if (!isSupabaseConfigured()) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ConnectionRequired />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Stats</h1>
      <div className="space-y-8">
        <StatsOverview userId={user?.id} />
        <AdvancedStats userId={user?.id} />
        {isLoadingScores ? (
          <div className="flex justify-center py-8">
            <Loader className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : scores.length > 0 ? (
          <ScoreChart data={scores} />
        ) : null}
        <ScorecardHistory userId={user?.id} />
      </div>
    </div>
  );
}