export interface PlayerSearchResult {
  id: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
}

export interface PlayerSearchState {
  query: string;
  results: PlayerSearchResult[];
  isLoading: boolean;
}