import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/shared/Toast/useToast';

interface ParPerformance {
  average: number;
  count: number;
  improvement?: number;
}

interface HandicapTrend {
  current: number | null;
  lastUpdated: string | null;
  trend?: number;
  periodRounds?: number;
  calculated?: number | null;
}

interface AdvancedStats {
  parPerformance: {
    [key: number]: ParPerformance;
  };
  distribution: {
    holeInOne: number;
    albatross: number;
    eagle: number;
    birdie: number;
    par: number;
    bogey: number;
    double: number;
    triple: number;
    other: number;
  };
  handicap: HandicapTrend;
}

function calculateHandicap(scores: { relative_score: number }[]): number | null {
  if (!scores || scores.length === 0) return null;

  // Take only the latest 20 rounds if we have more
  const recentScores = scores.slice(-20);
  
  // Calculate how many scores to use
  const numScoresToUse = recentScores.length >= 8 ? 8 : recentScores.length;
  
  // Sort scores by relative score (ascending)
  const sortedScores = [...recentScores]
    .filter(score => score.relative_score !== null)
    .sort((a, b) => a.relative_score - b.relative_score);
  
  if (sortedScores.length === 0) return null;
  
  // Take the best scores
  const bestScores = sortedScores.slice(0, numScoresToUse);
  
  // Calculate average of best scores
  const averageScore = bestScores.reduce((sum, score) => sum + score.relative_score, 0) / numScoresToUse;
  
  // Apply standard 0.96 multiplier for course rating adjustment
  return Math.round(averageScore * 0.96 * 10) / 10;
}

export function useAdvancedStats(userId?: string) {
  const [stats, setStats] = useState<AdvancedStats>({
    parPerformance: {},
    distribution: {
      holeInOne: 0,
      albatross: 0,
      eagle: 0,
      birdie: 0,
      par: 0,
      bogey: 0,
      double: 0,
      triple: 0,
      other: 0
    },
    handicap: {
      current: null,
      lastUpdated: null
    }
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

        // Get all completed scorecards for handicap calculation
        const { data: completedRounds, error: roundsError } = await supabase
          .from('scorecard_players')
          .select(`
            relative_score,
            completed_holes,
            scorecard:scorecards!inner(
              date
            )
          `)
          .eq('player_id', userId)
          .eq('completed_holes', 18) // Only include completed 18-hole rounds
          .not('relative_score', 'is', null)
          .order('scorecard(date)', { ascending: true });

        if (roundsError) throw roundsError;

        // Get all completed holes for detailed stats
        const { data: scores, error: scoresError } = await supabase
          .from('scorecard_scores')
          .select(`
            gross_score,
            hole_par,
            scorecard:scorecards!inner(
              id,
              date
            )
          `)
          .eq('player_id', userId)
          .not('gross_score', 'is', null)
          .order('scorecard(date)', { ascending: true });

        if (scoresError) throw scoresError;

        // Get user's official handicap
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('handicap, updated_at')
          .eq('id', userId)
          .single();

        if (profileError) throw profileError;

        // Process scores
        const parPerformance: Record<number, { scores: number[]; dates: string[] }> = {};
        const distribution = {
          holeInOne: 0,
          albatross: 0,
          eagle: 0,
          birdie: 0,
          par: 0,
          bogey: 0,
          double: 0,
          triple: 0,
          other: 0
        };

        scores?.forEach(score => {
          // Group scores by par
          if (!parPerformance[score.hole_par]) {
            parPerformance[score.hole_par] = { scores: [], dates: [] };
          }
          parPerformance[score.hole_par].scores.push(score.gross_score);
          parPerformance[score.hole_par].dates.push(score.scorecard.date);

          // Calculate relative to par
          const relativeToPar = score.gross_score - score.hole_par;
          
          // Determine score type
          if (score.gross_score === 1) {
            distribution.holeInOne++;
          } else if (relativeToPar <= -3) {
            if (score.hole_par >= 4 && score.gross_score === 2) {
              distribution.albatross++;
            } else {
              distribution.eagle++;
            }
          } else if (relativeToPar === -2) distribution.eagle++;
          else if (relativeToPar === -1) distribution.birdie++;
          else if (relativeToPar === 0) distribution.par++;
          else if (relativeToPar === 1) distribution.bogey++;
          else if (relativeToPar === 2) distribution.double++;
          else if (relativeToPar === 3) distribution.triple++;
          else distribution.other++;
        });

        // Calculate par performance with improvements
        const processedParPerformance: Record<number, ParPerformance> = {};
        Object.entries(parPerformance).forEach(([par, data]) => {
          const numPar = parseInt(par);
          const recentScores = data.scores.slice(-20); // Last 20 holes
          const olderScores = data.scores.slice(0, -20); // Older holes

          const average = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
          const oldAverage = olderScores.length > 0 
            ? olderScores.reduce((sum, score) => sum + score, 0) / olderScores.length
            : null;

          processedParPerformance[numPar] = {
            average,
            count: data.scores.length,
            improvement: oldAverage ? ((oldAverage - average) / oldAverage) * 100 : undefined
          };
        });

        // Calculate handicap trend
        const validRounds = completedRounds?.filter(r => r.relative_score !== null) || [];
        const calculatedHandicap = calculateHandicap(validRounds);
        
        // Calculate trend based on last 5 rounds vs previous 5, but only if we have more than 1 round
        const recentFive = validRounds.slice(-5);
        const previousFive = validRounds.slice(-10, -5);
        
        let trend: number | undefined;
        if (recentFive.length > 1 && previousFive.length > 0) {
          const recentAvg = recentFive.reduce((sum, r) => sum + r.relative_score, 0) / recentFive.length;
          const previousAvg = previousFive.reduce((sum, r) => sum + r.relative_score, 0) / previousFive.length;
          trend = recentAvg - previousAvg;
        }

        setStats({
          parPerformance: processedParPerformance,
          distribution,
          handicap: {
            current: profile?.handicap,
            lastUpdated: profile?.updated_at,
            calculated: calculatedHandicap,
            trend,
            periodRounds: recentFive.length
          }
        });
      } catch (error) {
        console.error('Error fetching advanced stats:', error);
        addToast('error', 'Failed to load advanced statistics');
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, [userId, addToast]);

  return { stats, isLoading };
}