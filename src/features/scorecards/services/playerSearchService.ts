import { supabase } from '@/lib/supabase';
import { PlayerSearchResult } from '../types/playerSearch';
import { handleError } from '../utils/errorHandling';
import { useAuth } from '@/features/auth/hooks/useAuth';

export async function searchPlayers(
  query: string,
  currentUserId: string,
  excludeIds: string[] = []
): Promise<PlayerSearchResult[]> {
  try {
    const { data, error } = await supabase
      .rpc('search_users', {
        current_user_id: currentUserId,
        search_query: query,
        max_results: 10
      });

    if (error) {
      throw handleError(error, 'Failed to search players');
    }

    return data
      ?.filter(user => !excludeIds.includes(user.id))
      .map(user => ({
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        avatarUrl: user.avatar_url
      })) || [];
  } catch (error) {
    throw handleError(error, 'Failed to search players');
  }
}