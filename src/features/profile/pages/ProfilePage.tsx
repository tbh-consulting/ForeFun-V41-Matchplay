import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, Settings } from 'lucide-react';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProfileForm } from '../components/ProfileForm';
import { StatsOverview } from '@/features/stats/components/StatsOverview';
import { ScoreChart } from '@/features/stats/components/ScoreChart';
import { AdvancedStats } from '@/features/stats/components/AdvancedStats';
import { ScorecardHistory } from '@/features/stats/components/ScorecardHistory';
import { PasswordSection } from '../components/form-sections/PasswordSection';
import { useProfile } from '../hooks/useProfile';
import { useScoreHistory } from '@/features/stats/hooks/useScoreHistory';
import { ConnectionRequired } from '@/components/shared/ConnectionRequired';
import { isSupabaseConfigured } from '@/lib/supabase';

export function ProfilePage() {
  const { profile, isLoading, updateProfile } = useProfile();
  const { scores, isLoading: isLoadingScores } = useScoreHistory(profile?.id);
  const [isEditing, setIsEditing] = useState(false);

  if (!isSupabaseConfigured()) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ConnectionRequired />
      </div>
    );
  }

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
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors duration-200"
              aria-label="Edit profile"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <div className="relative px-4 sm:px-6 lg:px-8 pb-8">
          <div className="relative -mt-16">
            {isEditing ? (
              <div className="max-w-2xl mx-auto">
                <ProfileForm
                  initialData={profile}
                  onSubmit={async (data) => {
                    await updateProfile(data);
                    setIsEditing(false);
                  }}
                  onCancel={() => setIsEditing(false)}
                />
              </div>
            ) : (
              <>
                <ProfileHeader
                  username={profile.username}
                  handicap={profile.handicap || 0}
                  avatarUrl={profile.avatarUrl}
                  fullName={profile.fullName}
                  homeClub={profile.homeClub}
                  country={profile.country}
                />
                <div className="mt-8">
                  <StatsOverview userId={profile.id} />
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
                      <AdvancedStats userId={profile.id} />
                    </div>
                  </>
                ) : null}
                <div className="mt-8">
                  <ScorecardHistory userId={profile.id} />
                </div>
                <div className="mt-8 max-w-md mx-auto">
                  <PasswordSection />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}