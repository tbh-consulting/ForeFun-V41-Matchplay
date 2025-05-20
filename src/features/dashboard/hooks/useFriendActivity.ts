import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/shared/Toast/useToast';
import { FriendActivity } from '../types';
import { useAuth } from '@/features/auth/hooks/useAuth';

const PAGE_SIZE = 20;

export function useFriendActivity() {
  const [activities, setActivities] = useState<FriendActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const { addToast } = useToast();
  const { user } = useAuth();

  const fetchFriendActivity = useCallback(async (pageNumber: number) => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Get friend IDs from accepted friend requests
      const { data: friends, error: friendError } = await supabase
        .rpc('get_friends', { user_id: user.id });

      if (friendError) throw friendError;

      // Create array of user IDs to fetch (include current user and friends)
      const userIds = [user.id, ...(friends?.map(f => f.friend_id) || [])];

      // Get recent scorecards with social interactions in a single query
      const { data: scorecardPlayers, error: playersError } = await supabase
        .from('scorecard_players')
        .select(`
          player_id,
          relative_score,
          completed_holes,
          total_points,
          team_id,
          scorecard:scorecards!inner(
            id,
            date,
            game_type,
            course:courses!inner(name)
          ),
          player:profiles!inner(
            id,
            username,
            avatar_url
          )
        `)
        .in('player_id', userIds)
        .order('scorecard(date)', { ascending: false })
        .range(pageNumber * PAGE_SIZE, (pageNumber + 1) * PAGE_SIZE - 1);

      if (playersError) throw playersError;

      // Get team data for team games
      const teamIds = scorecardPlayers
        ?.filter(sp => sp.team_id !== null)
        .map(sp => sp.team_id) || [];
      
      let teamsMap: Record<string, any> = {};
      
      if (teamIds.length > 0) {
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('id, name, relative_score, total_points, completed_holes, match_play_total')
          .in('id', teamIds);
          
        if (teamsError) throw teamsError;
        
        if (teamsData) {
          teamsMap = teamsData.reduce((acc, team) => {
            acc[team.id] = team;
            return acc;
          }, {} as Record<string, any>);
        }
      }

      // Get likes and comments for these scorecards
      const scorecardIds = scorecardPlayers?.map(sp => sp.scorecard.id) || [];
      
      const [{ data: likes }, { data: comments }] = await Promise.all([
        supabase
          .from('likes')
          .select('user_id, scorecard_id')
          .in('scorecard_id', scorecardIds),
        supabase
          .from('comments')
          .select(`
            id,
            content,
            created_at,
            scorecard_id,
            user:profiles!inner(
              id,
              username,
              avatar_url
            )
          `)
          .in('scorecard_id', scorecardIds)
          .order('created_at', { ascending: true })
      ]);

      // Group likes and comments by scorecard
      const likesMap = new Map();
      likes?.forEach(like => {
        const existing = likesMap.get(like.scorecard_id) || [];
        likesMap.set(like.scorecard_id, [...existing, like.user_id]);
      });

      const commentsMap = new Map();
      comments?.forEach(comment => {
        const existing = commentsMap.get(comment.scorecard_id) || [];
        commentsMap.set(comment.scorecard_id, [...existing, {
          id: comment.id,
          content: comment.content,
          createdAt: comment.created_at,
          user: {
            id: comment.user.id,
            username: comment.user.username,
            avatarUrl: comment.user.avatar_url
          }
        }]);
      });

      // Transform the data
      const newActivities: FriendActivity[] = [];
      
      scorecardPlayers?.forEach(sp => {
        // Check if this is a team game
        const isTeamGame = sp.scorecard.game_type === 'scramble' || sp.scorecard.game_type === '4ball';
        const hasTeam = isTeamGame && sp.team_id;
        
        // For team games, only show one activity per team
        if (hasTeam) {
          // Check if we already added this team's activity
          const existingTeamActivity = newActivities.find(
            a => a.scorecardId === sp.scorecard.id && a.teamId === sp.team_id
          );
          
          if (existingTeamActivity) {
            return; // Skip duplicate team activities
          }
          
          // Get team data
          const teamData = teamsMap[sp.team_id];
          if (!teamData) return;
          
          // Create team activity
          newActivities.push({
            id: `${sp.scorecard.id}-team-${sp.team_id}`,
            scorecardId: sp.scorecard.id,
            date: sp.scorecard.date,
            courseName: sp.scorecard.course.name,
            gameType: sp.scorecard.game_type,
            relativeScore: teamData.relative_score || 0,
            completedHoles: teamData.completed_holes || 0,
            points: teamData.total_points || 0,
            matchPlayTotal: teamData.match_play_total,
            user: {
              id: sp.player.id,
              username: teamData.name || 'Team',
              avatarUrl: null
            },
            isOwnActivity: sp.player.id === user.id,
            isTeam: true,
            teamId: sp.team_id,
            likes: likesMap.get(sp.scorecard.id) || [],
            comments: commentsMap.get(sp.scorecard.id) || []
          });
        } else {
          // Regular individual activity
          newActivities.push({
            id: `${sp.scorecard.id}-${sp.player_id}`,
            scorecardId: sp.scorecard.id,
            date: sp.scorecard.date,
            courseName: sp.scorecard.course.name,
            gameType: sp.scorecard.game_type,
            relativeScore: sp.relative_score || 0,
            completedHoles: sp.completed_holes || 0,
            points: sp.total_points || 0,
            user: {
              id: sp.player.id,
              username: sp.player.username,
              avatarUrl: sp.player.avatar_url
            },
            isOwnActivity: sp.player.id === user.id,
            isTeam: false,
            likes: likesMap.get(sp.scorecard.id) || [],
            comments: commentsMap.get(sp.scorecard.id) || []
          });
        }
      });

      // Update state based on page number
      if (pageNumber === 0) {
        setActivities(newActivities);
      } else {
        setActivities(prev => [...prev, ...newActivities]);
      }

      // Check if we have more data
      setHasMore(newActivities.length === PAGE_SIZE);
    } catch (error) {
      console.error('Error fetching friend activity:', error);
      addToast('error', 'Failed to load friend activity');
    } finally {
      setIsLoading(false);
    }
  }, [user, addToast]);

  // Initial load
  useEffect(() => {
    fetchFriendActivity(0);
  }, [fetchFriendActivity]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFriendActivity(nextPage);
    }
  }, [isLoading, hasMore, page, fetchFriendActivity]);

  return { 
    activities, 
    isLoading, 
    hasMore,
    loadMore,
    refresh: () => {
      setPage(0);
      fetchFriendActivity(0);
    }
  };
}