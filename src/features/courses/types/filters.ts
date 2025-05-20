export interface CourseFilters {
  status?: 'all' | 'in_progress' | 'completed';
  timeframe?: 'all' | 'today' | 'week' | 'month' | 'year';
  holes?: 9 | 18;
  dogFriendly?: boolean;
}

export const defaultFilters: CourseFilters = {
  status: 'all',
  timeframe: 'all',
  dogFriendly: false
};