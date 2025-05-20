import { useState } from 'react';
import { useToast } from '@/components/shared/Toast/useToast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function useFriendRequests() {
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  const { user } = useAuth();

  const acceptRequest = async (requestId: string) => {
    if (!user) return false;

    try {
      setIsLoading(true);

      // First verify the request exists and user is the receiver
      const { data: request, error: fetchError } = await supabase
        .from('friend_requests')
        .select('id, receiver_id')
        .eq('id', requestId)
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .single();

      if (fetchError || !request) {
        throw new Error('Friend request not found or unauthorized');
      }

      const { error } = await supabase
        .from('friend_requests')
        .update({ 
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      addToast('success', 'Friend request accepted');
      return true;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      addToast('error', 'Failed to accept friend request');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const rejectRequest = async (requestId: string) => {
    if (!user) return false;

    try {
      setIsLoading(true);

      // Delete the request using our new function
      const { error } = await supabase.rpc('delete_friend_request', {
        request_id: requestId,
        user_id: user.id
      });

      if (error) throw error;

      addToast('success', 'Friend request declined');
      return true;
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      addToast('error', 'Failed to decline friend request');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    acceptRequest,
    rejectRequest,
    isLoading
  };
}