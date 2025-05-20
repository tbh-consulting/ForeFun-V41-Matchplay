export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          email: string;
          full_name: string | null;
          handicap: number | null;
          home_club: string | null;
          language: string | null;
          phone: string | null;
          address: string | null;
          country: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          email?: string;
          full_name?: string | null;
          handicap?: number | null;
          home_club?: string | null;
          language?: string | null;
          phone?: string | null;
          address?: string | null;
          country?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string;
          full_name?: string | null;
          handicap?: number | null;
          home_club?: string | null;
          language?: string | null;
          phone?: string | null;
          address?: string | null;
          country?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      friend_requests: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          status: 'pending' | 'accepted' | 'rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          sender_id: string;
          receiver_id: string;
          status?: 'pending' | 'accepted' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: 'pending' | 'accepted' | 'rejected';
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: 'friend_request' | 'friend_accepted';
          data: {
            request_id: string;
            sender_id?: string;
            receiver_id?: string;
          };
          read: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          type: 'friend_request' | 'friend_accepted';
          data: {
            request_id: string;
            sender_id?: string;
            receiver_id?: string;
          };
          read?: boolean;
          created_at?: string;
        };
        Update: {
          read?: boolean;
        };
      };
    };
    Functions: {
      get_friends: {
        Args: { user_id: string };
        Returns: { friend_id: string }[];
      };
    };
  };
}