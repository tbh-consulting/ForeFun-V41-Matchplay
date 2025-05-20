import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/shared/Toast/useToast';
import { NewScorecard } from '../types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function useCreateScorecard() {
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const createScorecard = async (data: NewScorecard) => {
    if (!user) {
      addToast('error', 'You must be logged in to create a scorecard');
      return;
    }

    try {
      setIsLoading(true);

      // For team games, we just create a temporary scorecard
      // Teams will be created in the setup page
      const { data: result, error } = await supabase.rpc('create_scorecard', {
        p_course_id: data.courseId,
        p_created_by: user.id,
        p_date: data.date.toISOString(),
        p_weather: data.weather,
        p_game_type: data.gameType,
        p_player_ids: data.players || []
      });

      if (error) throw error;

      addToast('success', 'Scorecard created successfully!');
      return result;
    } catch (error) {
      console.error('Error creating scorecard:', error);
      addToast('error', 'Failed to create scorecard');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createScorecard,
    isLoading
  };
}