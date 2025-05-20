// Conversion constants
const YARDS_TO_METERS = 0.9144;
const METERS_TO_YARDS = 1.0936;

export function yardsToMeters(yards: number | null): number | null {
  if (yards === null) return null;
  return Math.round(yards * YARDS_TO_METERS);
}

export function metersToYards(meters: number | null): number | null {
  if (meters === null) return null;
  return Math.round(meters * METERS_TO_YARDS);
}