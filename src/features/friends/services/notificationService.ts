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
      friend_request:friend_requests!friend_request_id(
        id,
        status,
        sender:profiles!friend_requests_sender_id_fkey(
          username,
          full_name,
          avatar_url
        ),
        receiver:profiles!friend_requests_receiver_id_fkey(
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

export async function markAsRead(userId: string, notificationId: string) {
  return supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .eq('user_id', userId);
}

export async function markAllAsRead(userId: string) {
  return supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId);
}

export async function deleteNotification(userId: string, notificationId: string) {
  return supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)
    .eq('user_id', userId);
}

export async function updateFriendRequest(requestId: string, status: 'accepted' | 'rejected') {
  return supabase
    .from('friend_requests')
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', requestId);
}