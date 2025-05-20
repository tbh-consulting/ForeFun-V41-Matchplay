import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader, ArrowLeft } from 'lucide-react';
import { ProfileHeader } from '../components/ProfileHeader';
import { StatsOverview } from '@/features/stats/components/StatsOverview';
import { ScoreChart } from '@/features/stats/components/ScoreChart';
import { AdvancedStats } from '@/features/stats/components/AdvancedStats';
import { ScorecardHistory } from '@/features/stats/components/ScorecardHistory';
import { useProfile } from '../hooks/useProfile';
import { useScoreHistory } from '@/features/stats/hooks/useScoreHistory';
import { Button } from '@/components/shared/Button';

export function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { profile, isLoading } = useProfile(userId);
  const { scores, isLoading: isLoadingScores } = useScoreHistory(userId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="relative h-48 bg-gradient-to-r from-accent to-accent/80">
          <Button
            variant="secondary"
            className="absolute top-4 left-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
        </div>
        
        <div className="relative px-4 sm:px-6 lg:px-8 pb-8">
          <div className="relative -mt-16">
            <ProfileHeader
              username={profile.username}
              handicap={profile.handicap || 0}
              avatarUrl={profile.avatarUrl}
              fullName={profile.fullName}
              homeClub={profile.homeClub}
              country={profile.country}
            />
            <div className="mt-8">
              <StatsOverview userId={userId} />
            </div>
            {isLoadingScores ? (
              <div className="flex justify-center py-8">
                <Loader className="w-8 h-8 animate-spin text-accent" />
              </div>
            ) : scores.length > 0 ? (
              <>
                <div className="mt-8">
                  <ScoreChart data={scores} />
                </div>
                <div className="mt-8">
                  <AdvancedStats userId={userId} />
                </div>
              </>
            ) : null}
            <div className="mt-8">
              <ScorecardHistory userId={userId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}