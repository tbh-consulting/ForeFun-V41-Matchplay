import { NewScorecard } from '../types';

export function validateScorecardData(data: NewScorecard): string | null {
  if (!data.courseId) {
    return 'Please select a course';
  }

  if (!data.createdBy) {
    return 'User ID is required';
  }

  if (!data.date) {
    return 'Please select a date';
  }

  if (!data.weather) {
    return 'Please select weather conditions';
  }

  return null;
}