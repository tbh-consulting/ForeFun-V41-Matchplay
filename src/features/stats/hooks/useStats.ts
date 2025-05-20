import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/shared/Toast/useToast';

interface Stats {
  totalRounds: number;
  averageScore: number | null;
  bestScore: number | null;
  handicap: number | null;
}

export function useStats(userId?: string) {
  const [stats, setStats] = useState<Stats>({
    totalRounds: 0,
    averageScore: null,
    bestScore: null,
    handicap: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    async function fetchStats() {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Get user's profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('handicap')
          .eq('id', userId)
          .single();

        if (profileError) throw profileError;

        // Get completed scorecards (18 holes) with relative scores
        const { data: scorecardPlayers, error: scorecardError } = await supabase
          .from('scorecard_players')
          .select(`
            relative_score,
            completed_holes
          `)
          .eq('player_id', userId)
          .eq('completed_holes', 18) // Only include completed rounds
          .not('relative_score', 'is', null);

        if (scorecardError) throw scorecardError;

        // Calculate stats from valid scores
        const validScores = scorecardPlayers
          ?.map(sp => sp.relative_score)
          .filter((score): score is number => score !== undefined && score !== null) || [];

        setStats({
          totalRounds: validScores.length,
          averageScore: validScores.length > 0 
            ? Math.round((validScores.reduce((sum, score) => sum + score, 0) / validScores.length) * 10) / 10
            : null,
          bestScore: validScores.length > 0 
            ? Math.min(...validScores)
            : null,
          handicap: profile?.handicap || null
        });
      } catch (error) {
        console.error('Error loading stats:', error);
        addToast('error', 'Failed to load stats');
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, [userId, addToast]);

  return { stats, isLoading };
}