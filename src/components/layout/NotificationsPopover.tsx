import React, { useState } from 'react';
import { Bell, UserPlus, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NotificationsList } from '@/features/friends/components/NotificationsList';
import { useNotifications } from '@/features/friends/hooks/useNotifications';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

export function NotificationsPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    markAsRead,
    markAllAsRead,
    deleteNotification,
    respondToFriendRequest 
  } = useNotifications(5); // Limit to 5 notifications in the popover
  const containerRef = React.useRef<HTMLDivElement>(null);

  useOnClickOutside(containerRef, () => setIsOpen(false));

  const handleNotificationClick = async (notificationId: string) => {
    await markAsRead(notificationId);
    setIsOpen(false); // Close the popover
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-secondary hover:text-primary rounded-DEFAULT transition-colors duration-DEFAULT"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-accent hover:text-accent/80"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto p-4">
            <NotificationsList
              notifications={notifications}
              onMarkAsRead={handleNotificationClick}
              onDelete={deleteNotification}
              onRespondToRequest={respondToFriendRequest}
            />
          </div>
          <div className="p-4 border-t border-gray-200">
            <Link 
              to="/notifications"
              className="flex items-center justify-center text-accent hover:text-accent/80 gap-1"
              onClick={() => setIsOpen(false)}
            >
              See all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}