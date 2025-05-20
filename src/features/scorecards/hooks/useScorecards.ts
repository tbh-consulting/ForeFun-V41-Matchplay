import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/components/shared/Toast/useToast';
import { Scorecard, CourseFilters, CourseSortOption, GameType } from '../types';
import { SupabaseError } from '@/lib/supabase/error-handler';
import { supabase } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ScorecardFilters } from '../types/filters';

interface UseScorecardsOptions {
  sort?: CourseSortOption;
  limit?: number;
}

export function useScorecards(options?: UseScorecardsOptions) {
  const [scorecards, setScorecards] = useState<Scorecard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();
  const { user } = useAuth();

  const fetchScorecards = useCallback(async (
    filters?: ScorecardFilters,
    sort?: CourseSortOption,
    limit?: number
  ) => {
    if (!isSupabaseConfigured() || !user) {
      setError('Database connection not configured');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // First get all scorecard IDs where user is a player
      const { data: playerScorecards, error: playerError } = await supabase
        .from('scorecard_players')
        .select('scorecard_id, relative_score, total_points, completed_holes, team_id')
        .eq('player_id', user.id);

      if (playerError) throw playerError;

      // Get the scorecard IDs and create a map of relative scores
      const scorecardIds = playerScorecards?.map(ps => ps.scorecard_id) || [];
      const playerScores = new Map(
        playerScorecards?.map(ps => [ps.scorecard_id, {
          relativeScore: ps.relative_score,
          points: ps.total_points,
          completedHoles: ps.completed_holes,
          teamId: ps.team_id
        }]) || []
      );

      // Get team IDs for the user
      const userTeamIds = playerScorecards
        ?.filter(ps => ps.team_id !== null)
        .map(ps => ps.team_id) || [];

      // Then fetch scorecards where user is either a player or creator
      let query = supabase
        .from('scorecards')
        .select(`
          id,
          course_id,
          created_by,
          date,
          weather,
          game_type,
          created_at,
          updated_at,
          completed_at,
          course:courses(
            id,
            name,
            address,
            country,
            description,
            holes,
            image_url,
            dog_policy
          ),
          players:scorecard_players(
            player:profiles(
              id,
              username,
              avatar_url,
              handicap
            ),
            team_id,
            relative_score,
            total_points
          ),
          teams(
            id,
            name,
            handicap,
            total_gross_score,
            total_points,
            relative_score,
            completed_holes,
            match_play_total
          )
        `);

      // Only fetch scorecards where user is a player or creator
      if (scorecardIds.length > 0) {
        query = query.or(`id.in.(${scorecardIds.join(',')}),created_by.eq.${user.id}`);
      } else {
        query = query.eq('created_by', user.id);
      }

      // Apply filters
      if (filters?.status === 'completed') {
        query = query.not('completed_at', 'is', null);
      } else if (filters?.status === 'in_progress') {
        query = query.is('completed_at', null);
      }

      // Apply game type filter
      if (filters?.gameType && filters.gameType !== 'all') {
        query = query.eq('game_type', filters.gameType);
      }

      // Apply sorting
      if (sort) {
        query = query.order(sort.field, { ascending: sort.direction === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply limit
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      console.log("Raw data from Supabase:", data);

      setScorecards(data?.map(scorecard => {
        // Group players by team for team games
        let teams;
        if (scorecard.game_type === 'scramble' || scorecard.game_type === '4ball') {
          const teamPlayersMap: Record<string, any[]> = {};
          
          scorecard.players.forEach((p: any) => {
            if (p.team_id) {
              if (!teamPlayersMap[p.team_id]) {
                teamPlayersMap[p.team_id] = [];
              }
              teamPlayersMap[p.team_id].push({
                id: p.player.id,
                username: p.player.username,
                avatarUrl: p.player.avatar_url,
                handicap: p.player.handicap,
                teamId: p.team_id
              });
            }
          });
          
          teams = scorecard.teams.map((team: any) => {
            return {
              id: team.id,
              name: team.name,
              players: teamPlayersMap[team.id] || [],
              handicap: team.handicap || 0,
              totalGrossScore: team.total_gross_score,
              totalPoints: team.total_points,
              relativeScore: team.relative_score,
              completedHoles: team.completed_holes,
              matchPlayTotal: team.match_play_total
            };
          });
        }

        // Find user's team for team games
        let userTeam = null;
        if (teams && userTeamIds.length > 0) {
          userTeam = teams.find(team => userTeamIds.includes(team.id));
        }

        return {
          id: scorecard.id,
          courseId: scorecard.course_id,
          courseName: scorecard.course.name,
          createdBy: scorecard.created_by,
          date: new Date(scorecard.date),
          weather: scorecard.weather,
          gameType: scorecard.game_type as GameType,
          createdAt: scorecard.created_at,
          updatedAt: scorecard.updated_at,
          completedAt: scorecard.completed_at,
          players: scorecard.players.map((p: any) => ({
            id: p.player.id,
            username: p.player.username,
            avatarUrl: p.player.avatar_url,
            handicap: p.player.handicap,
            teamId: p.team_id,
            relativeScore: p.relative_score,
            points: p.total_points
          })),
          teams,
          userRelativeScore: playerScores.get(scorecard.id)?.relativeScore,
          userPoints: playerScores.get(scorecard.id)?.points,
          userTeam: userTeam
        };
      }) || []);
    } catch (error) {
      console.error('Error fetching scorecards:', error);
      const message = error instanceof SupabaseError 
        ? error.message 
        : 'Failed to load scorecards';
      setError(message);
      addToast('error', message);
    } finally {
      setIsLoading(false);
    }
  }, [addToast, user]);

  useEffect(() => {
    fetchScorecards(undefined, options?.sort, options?.limit);
  }, [fetchScorecards, options?.sort, options?.limit]);

  return {
    scorecards,
    isLoading,
    error,
    fetchScorecards,
    refresh: () => fetchScorecards(undefined, options?.sort, options?.limit)
  };
}