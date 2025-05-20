import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeSubscriptionProps {
  userId: string;
  onFriendRequestInsert: (payload: any) => void;
  onFriendRequestUpdate: (payload: any) => void;
  onFriendRequestDelete: (payload: any) => void;
}

export function useRealtimeSubscription({
  userId,
  onFriendRequestInsert,
  onFriendRequestUpdate,
  onFriendRequestDelete,
}: UseRealtimeSubscriptionProps) {
  useEffect(() => {
    let channel: RealtimeChannel;

    if (userId) {
      channel = supabase.channel('friend-requests')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'friend_requests',
          filter: `receiver_id=eq.${userId}`,
        }, onFriendRequestInsert)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'friend_requests',
          filter: `sender_id=eq.${userId}`,
        }, onFriendRequestInsert)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'friend_requests',
          filter: `or(sender_id.eq.${userId},receiver_id.eq.${userId})`,
        }, onFriendRequestUpdate)
        .on('postgres_changes', {
          event: 'DELETE',
          schema: 'public',
          table: 'friend_requests',
        }, onFriendRequestDelete)
        .subscribe();
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId]);
}