import { format, parseISO, isValid } from 'date-fns';

export function formatFriendshipDate(dateString: string | null | undefined): string {
  if (!dateString) return 'Recently';
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Recently';
    
    return format(date, 'MMM d, yyyy');
  } catch (error) {
    return 'Recently';
  }
}