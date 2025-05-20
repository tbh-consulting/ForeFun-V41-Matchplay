import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { WelcomeHeader } from '../components/WelcomeHeader';
import { StatsOverview } from '@/features/stats/components/StatsOverview';
import { ScoreChart } from '@/features/stats/components/ScoreChart';
import { FriendActivityFeed } from '../components/FriendActivity/FriendActivityFeed';
import { ConnectionRequired } from '@/components/shared/ConnectionRequired';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Loader } from 'lucide-react';
import { useScoreHistory } from '@/features/stats/hooks/useScoreHistory';

export function DashboardPage() {
  const { isAuthenticated, user } = useAuth();
  const { scores, isLoading: isLoadingScores } = useScoreHistory(user?.id);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ConnectionRequired />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <WelcomeHeader />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <StatsOverview userId={user?.id} />
          {isLoadingScores ? (
            <div className="flex justify-center py-8">
              <Loader className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : scores.length > 0 ? (
            <ScoreChart data={scores} />
          ) : null}
        </div>
        <div>
          <FriendActivityFeed />
        </div>
      </div>
    </div>
  );
}