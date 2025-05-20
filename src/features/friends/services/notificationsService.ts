import { supabase } from '@/lib/supabase';
import { NotificationResponse } from '../types/notifications';

export async function fetchNotifications(userId: string, limit?: number) {
  let query = supabase
    .from('notifications')
    .select(`
      id,
      type,
      data,
      read,
      created_at,
      related_notification_id,
      friend_requests (
        id,
        status,
        sender:profiles!friend_requests_sender_id_fkey (
          username,
          full_name,
          avatar_url
        ),
        receiver:profiles!friend_requests_receiver_id_fkey (
          username,
          full_name,
          avatar_url
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data as NotificationResponse[];
}

// Rest of the file remains unchanged...