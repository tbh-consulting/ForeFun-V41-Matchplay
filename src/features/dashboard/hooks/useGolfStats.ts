import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface GolfStats {
  handicap: number | null;
  roundsPlayed: number;
  bestScore: number | null;
  averageScore: number | null;
}

export function useGolfStats() {
  const [stats, setStats] = useState<GolfStats>({
    handicap: null,
    roundsPlayed: 0,
    bestScore: null,
    averageScore: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function loadStats() {
      if (!user) return;

      try {
        setIsLoading(true);
        
        // Get user's profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('handicap')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          return;
        }

        // Get relative score stats
        const { data: scorecards, error: scorecardsError } = await supabase
          .from('scorecard_players')
          .select('relative_score')
          .eq('player_id', user.id)
          .not('relative_score', 'is', null);

        if (scorecardsError) {
          console.error('Error fetching scorecards:', scorecardsError);
          return;
        }

        // Calculate stats from valid relative scores
        const validScores = scorecards
          .map(s => s.relative_score)
          .filter((score): score is number => score !== undefined && score !== null);

        setStats({
          handicap: profile?.handicap || null,
          roundsPlayed: validScores.length,
          bestScore: validScores.length > 0 ? Math.min(...validScores) : null,
          averageScore: validScores.length > 0 
            ? Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length)
            : null
        });
      } catch (error) {
        console.error('Error loading golf stats:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadStats();
  }, [user]);

  return { stats, isLoading };
}