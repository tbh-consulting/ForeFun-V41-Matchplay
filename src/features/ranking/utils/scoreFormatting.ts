export function formatRelativeScore(score: number): string {
  if (score === 0) return 'E';
  return score > 0 ? `+${score}` : score.toString();
}