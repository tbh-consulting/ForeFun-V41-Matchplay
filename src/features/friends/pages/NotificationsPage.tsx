import React from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationsList } from '../components/NotificationsList';
import { Button } from '@/components/shared/Button';

export function NotificationsPage() {
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead,
    deleteNotification,
    respondToFriendRequest,
    unreadCount 
  } = useNotifications();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Notifications
        </h1>
        {unreadCount > 0 && (
          <Button
            variant="secondary"
            onClick={markAllAsRead}
          >
            Mark all as read
          </Button>
        )}
      </div>
      <NotificationsList
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onDelete={deleteNotification}
        onRespondToRequest={respondToFriendRequest}
      />
    </div>
  );
}