import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/shared/Toast/useToast';

interface ScoreHistory {
  date: string;
  relativeScore: number;
}

export function useScoreHistory(userId?: string) {
  const [scores, setScores] = useState<ScoreHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    async function fetchScores() {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        const { data: scorecards, error } = await supabase
          .from('scorecard_players')
          .select(`
            relative_score,
            completed_holes,
            scorecard:scorecards(
              date
            )
          `)
          .eq('player_id', userId)
          .eq('completed_holes', 18) // Only include completed rounds
          .not('relative_score', 'is', null)
          .order('scorecard(date)', { ascending: true });

        if (error) throw error;

        const formattedScores = scorecards
          .filter(s => s.scorecard && s.relative_score !== null)
          .map(s => ({
            date: s.scorecard.date,
            relativeScore: s.relative_score
          }));

        setScores(formattedScores);
      } catch (error) {
        console.error('Error loading score history:', error);
        addToast('error', 'Failed to load score history');
      } finally {
        setIsLoading(false);
      }
    }

    fetchScores();
  }, [userId, addToast]);

  return { scores, isLoading };
}