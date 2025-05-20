import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/shared/Toast/useToast';

interface ScorecardHistory {
  id: string;
  courseName: string;
  date: string;
  relativeScore: number | null;
  totalPoints: number;
}

export function useScorecardHistory(userId?: string) {
  const [scorecards, setScorecards] = useState<ScorecardHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    async function fetchScorecards() {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Get all completed scorecards where user is a player
        const { data: scorecardPlayers, error } = await supabase
          .from('scorecard_players')
          .select(`
            relative_score,
            total_points,
            completed_holes,
            scorecard:scorecards(
              id,
              date,
              course:courses(
                name
              )
            )
          `)
          .eq('player_id', userId)
          .eq('completed_holes', 18) // Only include completed rounds
          .order('scorecard(date)', { ascending: false });

        if (error) throw error;

        // Format the data
        const formattedScorecards = scorecardPlayers
          .filter(sp => sp.scorecard)
          .map(sp => ({
            id: sp.scorecard.id,
            courseName: sp.scorecard.course.name,
            date: sp.scorecard.date,
            relativeScore: sp.relative_score,
            totalPoints: sp.total_points || 0
          }));

        setScorecards(formattedScorecards);
      } catch (error) {
        console.error('Error loading scorecard history:', error);
        addToast('error', 'Failed to load scorecard history');
      } finally {
        setIsLoading(false);
      }
    }

    fetchScorecards();
  }, [userId, addToast]);

  return { scorecards, isLoading };
}