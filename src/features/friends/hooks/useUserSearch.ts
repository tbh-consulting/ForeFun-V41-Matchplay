import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchResult {
  id: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  friendStatus: 'none' | 'friends' | 'pending_sent' | 'pending_received';
}

export function useUserSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const searchUsers = async () => {
      if (!debouncedQuery || debouncedQuery.length < 2 || !user) {
        setResults([]);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .rpc('search_users', {
            search_query: debouncedQuery,
            current_user_id: user.id,
            max_results: 10
          });

        if (error) throw error;

        setResults(data?.map(user => ({
          id: user.id,
          username: user.username,
          fullName: user.full_name,
          avatarUrl: user.avatar_url,
          friendStatus: user.friend_status
        })) || []);
      } catch (error) {
        console.error('Error searching users:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchUsers();

    // Set up realtime subscription for friend request updates
    const channel = supabase.channel('friend-status-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'friend_requests',
        filter: `sender_id=eq.${user?.id},receiver_id=eq.${user?.id}`,
      }, () => {
        // Refresh search results when friend requests change
        searchUsers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [debouncedQuery, user]);

  return {
    query,
    setQuery,
    results,
    isLoading
  };
}