export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
  sender?: {
    username: string;
    full_name: string | null;
    avatarUrl: string | null;
  };
  receiver?: {
    username: string;
    full_name: string | null;
    avatarUrl: string | null;
  };
}

export interface Notification {
  id: string;
  type: 'friend_request' | 'friend_accepted';
  data: {
    request_id: string;
    sender_id?: string;
    receiver_id?: string;
  };
  read: boolean;
  createdAt: string;
  friend_request?: {
    id: string;
    status: 'pending' | 'accepted' | 'rejected';
    sender?: {
      username: string;
      full_name: string | null;
      avatarUrl: string | null;
    };
    receiver?: {
      username: string;
      full_name: string | null;
      avatarUrl: string | null;
    };
  };
}