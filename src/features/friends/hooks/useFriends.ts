import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/shared/Toast/useToast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { FriendRequest } from '../types';

export function useFriends() {
  const [friends, setFriends] = useState<FriendRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { addToast } = useToast();

  const fetchFriendData = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const [friendsResponse, pendingResponse, sentResponse] = await Promise.all([
        // Get accepted friend requests
        supabase
          .from('friend_requests')
          .select(`
            id,
            sender_id,
            receiver_id,
            status,
            created_at,
            updated_at,
            sender:profiles!friend_requests_sender_id_fkey(
              id,
              username,
              avatar_url,
              handicap
            ),
            receiver:profiles!friend_requests_receiver_id_fkey(
              id,
              username,
              avatar_url,
              handicap
            )
          `)
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .eq('status', 'accepted'),
        
        // Get pending requests received
        supabase
          .from('friend_requests')
          .select(`
            id,
            sender_id,
            receiver_id,
            status,
            created_at,
            updated_at,
            sender:profiles!friend_requests_sender_id_fkey(
              id,
              username,
              avatar_url,
              handicap
            )
          `)
          .eq('receiver_id', user.id)
          .eq('status', 'pending'),
        
        // Get pending requests sent
        supabase
          .from('friend_requests')
          .select(`
            id,
            sender_id,
            receiver_id,
            status,
            created_at,
            updated_at,
            receiver:profiles!friend_requests_receiver_id_fkey(
              id,
              username,
              avatar_url,
              handicap
            )
          `)
          .eq('sender_id', user.id)
          .eq('status', 'pending')
      ]);

      setFriends(friendsResponse.data || []);
      setPendingRequests(pendingResponse.data || []);
      setSentRequests(sentResponse.data || []);
    } catch (error) {
      console.error('Error fetching friend data:', error);
      addToast('error', 'Failed to load friends');
    } finally {
      setIsLoading(false);
    }
  }, [user, addToast]);

  const sendFriendRequest = async (receiverId: string) => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          status: 'pending'
        });

      if (error) throw error;

      addToast('success', 'Friend request sent');
      await fetchFriendData();
    } catch (error) {
      console.error('Error sending friend request:', error);
      addToast('error', 'Failed to send friend request');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelRequest = async (requestId: string) => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Delete the request using our new function
      const { error } = await supabase.rpc('delete_friend_request', {
        request_id: requestId,
        user_id: user.id
      });

      if (error) throw error;

      // Update local state
      setSentRequests(prev => prev.filter(req => req.id !== requestId));
      addToast('success', 'Friend request cancelled');
    } catch (error) {
      console.error('Error cancelling friend request:', error);
      addToast('error', 'Failed to cancel friend request');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFriendData();
  }, [fetchFriendData]);

  return {
    friends,
    pendingRequests,
    sentRequests,
    isLoading,
    sendFriendRequest,
    cancelRequest,
    refresh: fetchFriendData
  };
}