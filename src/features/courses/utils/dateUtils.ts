import { format, parseISO, formatDistanceToNow } from 'date-fns';

export function formatCourseDate(dateString: string | null | undefined): string {
  if (!dateString) return 'Recently';
  
  try {
    const date = parseISO(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    return 'Recently';
  }
}

export function formatReviewDate(dateString: string | null | undefined): string {
  if (!dateString) return 'Recently';
  
  try {
    const date = parseISO(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    return 'Recently';
  }
}