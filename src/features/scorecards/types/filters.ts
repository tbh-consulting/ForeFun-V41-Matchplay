import { GameType } from '../types';

export interface ScorecardFilters {
  status: 'all' | 'in_progress' | 'completed';
  timeframe: 'all' | 'today' | 'week' | 'month' | 'year';
  gameType?: GameType | 'all';
}

export const defaultFilters: ScorecardFilters = {
  status: 'all',
  timeframe: 'all',
  gameType: 'all'
};