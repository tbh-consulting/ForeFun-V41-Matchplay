import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { CourseSelection } from '../components/ScorecardCreation/CourseSelection';
import { GameTypeSelection } from '../components/ScorecardCreation/GameTypeSelection';
import { useCreateScorecard } from '../hooks/useCreateScorecard';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ConnectionRequired } from '@/components/shared/ConnectionRequired';
import { isSupabaseConfigured } from '@/lib/supabase';
import { GameType } from '../types';

type Step = 'course' | 'gameType';

export function NewScorecardPage() {
  const navigate = useNavigate();
  const { createScorecard, isLoading } = useCreateScorecard();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('course');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedGameType, setSelectedGameType] = useState<GameType>('strokeplay');

  if (!isSupabaseConfigured()) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
        <ConnectionRequired />
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourseId(courseId);
    setStep('gameType');
  };

  const handleGameTypeSelect = async (gameType: GameType) => {
    setSelectedGameType(gameType);
    
    try {
      if (!selectedCourseId) return;
      
      // Create a temporary scorecard with minimal information
      const result = await createScorecard({
        courseId: selectedCourseId,
        createdBy: user.id,
        date: new Date(),
        weather: 'sunny',
        gameType: gameType,
        players: [] // Start with just the creator
      });

      if (result?.id) {
        // Navigate to setup page to select players and teams
        navigate(`/scorecards/${result.id}/setup`);
      }
    } catch (error) {
      console.error('Error creating scorecard:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
      <div className="flex items-center mb-4 sm:mb-6">
        <Button
          variant="secondary"
          className="mr-3 sm:mr-4 !py-1.5 sm:!py-2 !px-3 sm:!px-4 text-xs sm:text-sm"
          onClick={() => {
            if (step === 'gameType') {
              setStep('course');
            } else {
              navigate('/scorecards');
            }
          }}
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
          Back
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Create New Scorecard</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        {step === 'course' ? (
          <CourseSelection
            onSelect={handleCourseSelect}
            isLoading={isLoading}
          />
        ) : (
          <GameTypeSelection
            selectedGameType={selectedGameType}
            onSelect={handleGameTypeSelect}
            onBack={() => setStep('course')}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}