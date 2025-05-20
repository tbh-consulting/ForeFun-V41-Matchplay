import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/shared/Toast/useToast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function useDeleteScorecard() {
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const deleteScorecard = async (scorecardId: string) => {
    if (!user) {
      addToast('error', 'You must be logged in to delete a scorecard');
      return;
    }

    try {
      setIsLoading(true);

      // First verify the user is the creator and the scorecard exists
      const { data: scorecard, error: fetchError } = await supabase
        .from('scorecards')
        .select('created_by, id')
        .eq('id', scorecardId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          throw new Error('Scorecard not found');
        }
        throw fetchError;
      }

      if (!scorecard) {
        throw new Error('Scorecard not found');
      }

      if (scorecard.created_by !== user.id) {
        throw new Error('You can only delete scorecards you created');
      }

      // Check if there are any players for this scorecard
      const { data: players, error: playersError } = await supabase
        .from('scorecard_players')
        .select('id')
        .eq('scorecard_id', scorecardId);

      if (playersError) throw playersError;

      // Only delete player records if they exist
      if (players && players.length > 0) {
        const { error: deletePlayersError } = await supabase
          .from('scorecard_players')
          .delete()
          .eq('scorecard_id', scorecardId);

        if (deletePlayersError) throw deletePlayersError;
      }

      // Check if there are any scores for this scorecard
      const { data: scores, error: scoresError } = await supabase
        .from('scorecard_scores')
        .select('id')
        .eq('scorecard_id', scorecardId);

      if (scoresError) throw scoresError;

      // Only delete score records if they exist
      if (scores && scores.length > 0) {
        const { error: deleteScoresError } = await supabase
          .from('scorecard_scores')
          .delete()
          .eq('scorecard_id', scorecardId);

        if (deleteScoresError) throw deleteScoresError;
      }

      // Finally delete the scorecard itself
      const { error: deleteScorecardError } = await supabase
        .from('scorecards')
        .delete()
        .eq('id', scorecardId)
        .eq('created_by', user.id); // Extra safety check

      if (deleteScorecardError) throw deleteScorecardError;

      addToast('success', 'Scorecard deleted successfully');
      navigate('/scorecards');
    } catch (error) {
      console.error('Error deleting scorecard:', error);
      addToast('error', error instanceof Error ? error.message : 'Failed to delete scorecard');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deleteScorecard,
    isLoading
  };
}