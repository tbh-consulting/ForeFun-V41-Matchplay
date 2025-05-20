import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/shared/Toast/useToast';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Comment } from '../types';

export function useComments(scorecardId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();
  const { user } = useAuth();

  const fetchComments = useCallback(async () => {
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
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user:profiles (
            id,
            username,
            avatar_url
          )
        `)
        .eq('scorecard_id', scorecardId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setComments(data.map(comment => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.created_at,
        user: {
          id: comment.user.id,
          username: comment.user.username,
          avatarUrl: comment.user.avatar_url
        }
      })));
    } catch (error) {
      console.error('Error fetching comments:', error);
      addToast('error', 'Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  }, [scorecardId, addToast]);

  const addComment = async (content: string) => {
    if (!user || !content.trim()) return;

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

      const { data, error } = await supabase
        .from('comments')
        .insert({
          scorecard_id: scorecardId,
          user_id: user.id,
          content: content.trim()
        })
        .select(`
          id,
          content,
          created_at,
          user:profiles (
            id,
            username,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      // Optimistically update the local state
      const newComment: Comment = {
        id: data.id,
        content: data.content,
        createdAt: data.created_at,
        user: {
          id: data.user.id,
          username: data.user.username,
          avatarUrl: data.user.avatar_url
        }
      };

      setComments(prev => [...prev, newComment]);
    } catch (error) {
      console.error('Error adding comment:', error);
      addToast('error', 'Failed to add comment');
    }
  };

  const deleteComment = async (commentId: string) => {
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

      // Optimistically update the local state
      setComments(prev => prev.filter(comment => comment.id !== commentId));

      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) {
        // Revert on error
        await fetchComments();
        throw error;
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      addToast('error', 'Failed to delete comment');
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`comments:${scorecardId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `scorecard_id=eq.${scorecardId}`
      }, () => {
        // Immediately fetch latest comments when any change occurs
        fetchComments();
      })
      .subscribe();

    // Initial fetch
    fetchComments();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [scorecardId, fetchComments]);

  return {
    comments,
    isLoading,
    addComment,
    deleteComment,
    fetchComments
  };
}