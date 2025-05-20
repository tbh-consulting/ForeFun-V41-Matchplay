import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Bell, UserPlus, Check, X, Trash2, Heart, MessageCircle } from 'lucide-react';
import { Notification } from '../types';
import { useNavigate } from 'react-router-dom';

interface NotificationsListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onRespondToRequest?: (requestId: string, accept: boolean) => void;
}

export function NotificationsList({
  notifications,
  onMarkAsRead,
  onDelete,
  onRespondToRequest,
}: NotificationsListProps) {
  const navigate = useNavigate();

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    await onMarkAsRead(notification.id);

    // Navigate based on notification type
    if (notification.type === 'scorecard_liked' || notification.type === 'scorecard_commented') {
      const scorecardId = notification.data.scorecard_id;
      if (scorecardId) {
        navigate(`/scorecards/${scorecardId}`);
      }
    }
  };

  const getNotificationContent = (notification: Notification) => {
    const username = notification.data.username || 'Someone';

    switch (notification.type) {
      case 'friend_request':
        return {
          icon: <UserPlus className="w-5 h-5 text-accent" />,
          message: 'sent you a friend request',
          showActions: notification.friend_request?.status === 'pending',
        };
      case 'friend_accepted':
        return {
          icon: <Check className="w-5 h-5 text-green-500" />,
          message: 'accepted your friend request',
          showActions: false,
        };
      case 'scorecard_liked':
        return {
          icon: <Heart className="w-5 h-5 text-red-500" />,
          message: 'liked your scorecard',
          showActions: false,
        };
      case 'scorecard_commented':
        return {
          icon: <MessageCircle className="w-5 h-5 text-blue-500" />,
          message: 'commented on your scorecard',
          showActions: false,
        };
      default:
        return {
          icon: <Bell className="w-5 h-5 text-gray-500" />,
          message: 'New notification',
          showActions: false,
        };
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No notifications
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {notifications.map((notification) => {
        const content = getNotificationContent(notification);
        const friendRequest = notification.friend_request;
        const username = notification.data.username || 'Someone';
        
        return (
          <div
            key={notification.id}
            className={`
              p-4 rounded-lg transition-colors relative group cursor-pointer
              ${notification.read ? 'bg-white' : 'bg-blue-50'}
              ${(notification.type === 'scorecard_liked' || notification.type === 'scorecard_commented') ? 'hover:bg-gray-50' : ''}
            `}
            onClick={() => handleNotificationClick(notification)}
          >
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-white rounded-full shadow-sm">
                {content.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{username}</span>
                      {' '}{content.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {content.showActions && onRespondToRequest && (
                    <div className="flex space-x-1 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRespondToRequest(friendRequest.id, true);
                          onMarkAsRead(notification.id);
                        }}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                        title="Accept request"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRespondToRequest(friendRequest.id, false);
                          onMarkAsRead(notification.id);
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Decline request"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(notification.id);
              }}
              className="absolute right-2 top-2 p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
              title="Delete notification"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}