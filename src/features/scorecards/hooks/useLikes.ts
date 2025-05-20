import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/shared/Toast/useToast';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function useLikes(scorecardId: string) {
  const [likes, setLikes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();
  const { user } = useAuth();

  const fetchLikes = useCallback(async () => {
    try {
      setIsLoading(true);

      // First verify the scorecard exists
      const { data: scorecard, error: scorecardError } = await supabase
        .from('scorecards')
        .select('id')
        .eq('id', scorecardId)
        .single();

      if (scorecardError || !scorecard) {
        throw new Error('Scorecard not found');
      }

      const { data, error } = await supabase
        .from('likes')
        .select('user_id')
        .eq('scorecard_id', scorecardId);

      if (error) throw error;
      setLikes(data.map(like => like.user_id));
    } catch (error) {
      console.error('Error fetching likes:', error);
      addToast('error', 'Failed to load likes');
    } finally {
      setIsLoading(false);
    }
  }, [scorecardId, addToast]);

  const toggleLike = async () => {
    if (!user) return;

    try {
      // First verify the scorecard exists
      const { data: scorecard, error: scorecardError } = await supabase
        .from('scorecards')
        .select('id')
        .eq('id', scorecardId)
        .single();

      if (scorecardError || !scorecard) {
        throw new Error('Scorecard not found');
      }

      const hasLiked = likes.includes(user.id);

      if (hasLiked) {
        // Optimistically update UI
        setLikes(prev => prev.filter(id => id !== user.id));
        
        // Remove like
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('scorecard_id', scorecardId)
          .eq('user_id', user.id);

        if (error) {
          // Revert on error
          setLikes(prev => [...prev, user.id]);
          throw error;
        }
      } else {
        // Optimistically update UI
        setLikes(prev => [...prev, user.id]);
        
        // Add like
        const { error } = await supabase
          .from('likes')
          .insert({ scorecard_id: scorecardId, user_id: user.id });

        if (error) {
          // Revert on error
          setLikes(prev => prev.filter(id => id !== user.id));
          throw error;
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      addToast('error', 'Failed to update like');
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`likes:${scorecardId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'likes',
        filter: `scorecard_id=eq.${scorecardId}`
      }, () => {
        // Immediately fetch latest likes when any change occurs
        fetchLikes();
      })
      .subscribe();

    // Initial fetch
    fetchLikes();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [scorecardId, fetchLikes]);

  return {
    likes,
    isLoading,
    toggleLike,
    hasLiked: user ? likes.includes(user.id) : false,
    fetchLikes
  };
}