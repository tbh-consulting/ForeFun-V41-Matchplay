import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { PlayerSearchResult } from '../types/playerSearch';
import { searchPlayers } from '../services/playerSearchService';
import { handleError } from '../utils/errorHandling';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function usePlayerSearch(existingPlayerIds: string[]) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlayerSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const { user } = useAuth();

  useEffect(() => {
    async function performSearch() {
      if (!debouncedQuery || debouncedQuery.length < 2 || !user) {
        setResults([]);
        return;
      }

      try {
        setIsLoading(true);
        const searchResults = await searchPlayers(debouncedQuery, user.id, existingPlayerIds);
        setResults(searchResults);
      } catch (error) {
        console.error('Error searching players:', handleError(error, 'Search failed'));
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }

    performSearch();
  }, [debouncedQuery, existingPlayerIds, user]);

  return {
    query,
    setQuery,
    results,
    isLoading
  };
}