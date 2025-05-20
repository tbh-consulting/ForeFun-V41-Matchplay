import { useState } from 'react';
import { useToast } from '@/components/shared/Toast/useToast';
import { getPlayerProfile, addPlayerToScorecard } from '../services/playerService';
import { handleError } from '../utils/errorHandling';

export function useAddPlayer() {
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const addPlayer = async (scorecardId: string, playerId: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const profile = await getPlayerProfile(playerId);
      await addPlayerToScorecard(scorecardId, playerId, profile.handicap);

      addToast('success', 'Player added successfully');
      return true;
    } catch (error) {
      const scorecardError = handleError(error, 'Failed to add player');
      console.error('Error adding player:', scorecardError);
      addToast('error', scorecardError.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addPlayer,
    isLoading
  };
}