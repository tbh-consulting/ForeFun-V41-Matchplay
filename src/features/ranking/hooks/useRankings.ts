import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/shared/Toast/useToast';
import { CourseRanking } from '../types';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function useRankings(friendsOnly: boolean = false) {
  const [rankings, setRankings] = useState<CourseRanking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    async function fetchRankings() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        let userIds: string[];

        if (friendsOnly) {
          // Get friend IDs
          const { data: friends, error: friendError } = await supabase
            .rpc('get_friends', { user_id: user.id });

          if (friendError) throw friendError;
          userIds = [user.id, ...(friends?.map(f => f.friend_id) || [])];
        } else {
          // Get all users
          const { data: users, error: usersError } = await supabase
            .from('profiles')
            .select('id');

          if (usersError) throw usersError;
          userIds = users.map(u => u.id);
        }

        // Get best scores for each course
        const { data: scores, error: scoresError } = await supabase
          .from('scorecard_players')
          .select(`
            relative_score,
            player:profiles!inner(
              id,
              username,
              avatar_url
            ),
            scorecard:scorecards!inner(
              id,
              course:courses!inner(
                id,
                name
              )
            )
          `)
          .in('player_id', userIds)
          .eq('completed_holes', 18) // Only include completed rounds
          .not('relative_score', 'is', null)
          .order('relative_score', { ascending: true });

        if (scoresError) throw scoresError;

        // Group and transform the data
        const courseMap = new Map<string, CourseRanking>();

        scores?.forEach(score => {
          const courseId = score.scorecard.course.id;
          const courseName = score.scorecard.course.name;

          if (!courseMap.has(courseId)) {
            courseMap.set(courseId, {
              courseId,
              courseName,
              rankings: []
            });
          }

          const courseRanking = courseMap.get(courseId)!;
          
          // Only add if this player isn't already in the rankings
          if (!courseRanking.rankings.some(r => r.id === score.player.id)) {
            courseRanking.rankings.push({
              id: score.player.id,
              username: score.player.username,
              avatarUrl: score.player.avatar_url,
              relativeScore: score.relative_score,
              scorecardId: score.scorecard.id
            });
          }
        });

        // Process each course's rankings
        const finalRankings = Array.from(courseMap.values())
          .map(course => {
            // Sort all rankings by score
            const sortedRankings = course.rankings
              .sort((a, b) => a.relativeScore - b.relativeScore)
              .map((ranking, index) => ({
                ...ranking,
                position: index + 1
              }));

            // Find user's ranking if they played this course
            const userRanking = sortedRankings.find(r => r.id === user.id);
            
            // Get top 3 for display
            const top3 = sortedRankings.slice(0, 3);

            return {
              ...course,
              rankings: top3,
              userRanking: userRanking && !top3.some(r => r.id === user.id) 
                ? userRanking 
                : undefined
            };
          })
          // Sort courses alphabetically by name
          .sort((a, b) => a.courseName.localeCompare(b.courseName));

        setRankings(finalRankings);
      } catch (error) {
        console.error('Error fetching rankings:', error);
        addToast('error', 'Failed to load rankings');
      } finally {
        setIsLoading(false);
      }
    }

    fetchRankings();
  }, [user, addToast, friendsOnly]);

  return { rankings, isLoading };
}