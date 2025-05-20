import React, { useState } from 'react';
import { Modal } from '@/components/shared/Modal/Modal';
import { CourseSelection } from './steps/CourseSelection';
import { GameTypeSelection } from './steps/GameTypeSelection';
import { PlayerSelection } from './steps/PlayerSelection';
import { TeamFormation } from './steps/TeamFormation';
import { DateWeatherSelection } from './steps/DateWeatherSelection';
import { useCreateScorecard } from '../../hooks/useCreateScorecard';
import { NewScorecard, GameType, Team } from '../../types';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface ScorecardCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ScorecardCreationModal({ isOpen, onClose }: ScorecardCreationModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<NewScorecard>>({
    gameType: 'strokeplay'
  });
  const [teams, setTeams] = useState<Team[]>([]);
  const { createScorecard, isLoading } = useCreateScorecard();
  const { user } = useAuth();

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = async () => {
    if (!formData.courseId || !formData.date || !formData.weather || !formData.gameType) {
      return;
    }

    try {
      // For team games, we need to format the data differently
      if (formData.gameType !== 'strokeplay' && teams.length > 0) {
        await createScorecard({
          ...formData as NewScorecard,
          teams: teams.map(team => ({
            name: team.name,
            playerIds: team.players.map(p => p.id)
          }))
        });
      } else {
        await createScorecard(formData as NewScorecard);
      }
      onClose();
    } catch (error) {
      console.error('Error creating scorecard:', error);
    }
  };

  const needsTeamFormation = formData.gameType === 'scramble' || formData.gameType === '4ball';

  const steps = {
    1: (
      <CourseSelection
        selectedCourseId={formData.courseId}
        onSelect={(courseId) => {
          setFormData(prev => ({ ...prev, courseId }));
          handleNext();
        }}
      />
    ),
    2: (
      <GameTypeSelection
        selectedGameType={formData.gameType as GameType}
        onSelect={(gameType) => {
          setFormData(prev => ({ ...prev, gameType }));
        }}
        onNext={handleNext}
        onBack={handleBack}
      />
    ),
    3: (
      <PlayerSelection
        selectedPlayers={formData.players || []}
        onSelect={(players) => {
          setFormData(prev => ({ ...prev, players }));
          if (needsTeamFormation) {
            handleNext();
          } else {
            setStep(5); // Skip team formation for strokeplay
          }
        }}
        onBack={handleBack}
      />
    ),
    4: needsTeamFormation ? (
      <TeamFormation
        players={(formData.players || []).map(id => {
          // Find player info from the user's friends list or use placeholder
          return {
            id,
            username: id === user?.id ? user.username : `Player ${id.substring(0, 4)}`,
            avatarUrl: null,
            handicap: null
          };
        })}
        gameType={formData.gameType as GameType}
        onTeamsChange={setTeams}
        onNext={handleNext}
        onBack={handleBack}
      />
    ) : null,
    5: (
      <DateWeatherSelection
        date={formData.date}
        weather={formData.weather}
        onSubmit={(data) => {
          setFormData(prev => ({ ...prev, ...data }));
          handleSubmit();
        }}
        onBack={handleBack}
        isLoading={isLoading}
      />
    )
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Scorecard"
    >
      {steps[step as keyof typeof steps]}
    </Modal>
  );
}