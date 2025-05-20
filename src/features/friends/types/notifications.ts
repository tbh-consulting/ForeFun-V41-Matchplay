export interface NotificationResponse {
  id: string;
  type: 'friend_request' | 'friend_accepted' | 'scorecard_liked' | 'scorecard_commented';
  data: {
    request_id?: string;
    sender_id?: string;
    receiver_id?: string;
    scorecard_id?: string;
    username?: string;
    avatar_url?: string;
    comment?: string;
  };
  read: boolean;
  created_at: string;
  related_notification_id: string | null;
  friend_request: {
    id: string;
    status: 'pending' | 'accepted' | 'rejected';
    sender: {
      username: string;
      full_name: string | null;
      avatar_url: string | null;
    };
    receiver: {
      username: string;
      full_name: string | null;
      avatar_url: string | null;
    };
  } | null;
}

export interface Notification extends Omit<NotificationResponse, 'created_at'> {
  createdAt: string;
}