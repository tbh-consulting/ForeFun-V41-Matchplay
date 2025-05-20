import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useToast } from '@/components/shared/Toast/useToast';
import { Notification } from '../types/notifications';
import * as notificationService from '../services/notificationService';
import { isSupabaseConfigured } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

export function useNotifications(limit?: number) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { addToast } = useToast();

  const fetchNotifications = async () => {
    if (!user) return;
    if (!isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await notificationService.fetchNotifications(user.id, limit);
      
      const enrichedNotifications = data.map(notification => ({
        ...notification,
        createdAt: notification.created_at,
        friend_request: notification.friend_request
      }));

      setNotifications(enrichedNotifications);
      setUnreadCount(enrichedNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      if (!(error instanceof TypeError)) {
        addToast('error', 'Failed to load notifications');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(user?.id || '', notificationId);
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      addToast('error', 'Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(user?.id || '');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      addToast('error', 'Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(user?.id || '', notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => 
        prev - (notifications.find(n => n.id === notificationId)?.read ? 0 : 1)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
      addToast('error', 'Failed to delete notification');
    }
  };

  const respondToFriendRequest = async (requestId: string, accept: boolean) => {
    try {
      await notificationService.updateFriendRequest(requestId, accept ? 'accepted' : 'rejected');
      await fetchNotifications();
      addToast('success', accept ? 'Friend request accepted!' : 'Friend request declined');
    } catch (error) {
      console.error('Error responding to friend request:', error);
      addToast('error', 'Failed to respond to friend request');
    }
  };

  // Set up real-time subscription for new notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, limit]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    respondToFriendRequest,
  };
}