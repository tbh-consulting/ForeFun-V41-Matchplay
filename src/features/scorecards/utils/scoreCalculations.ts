export function calculateNetScore(score: number, par: number): number {
  return score > 0 ? score - par : 0;
}

export function calculateTotalScore(scores: Record<number, number>): number {
  return Object.values(scores).reduce((sum, score) => sum + (score || 0), 0);
}

export function calculateNetTotal(
  scores: Record<number, number>,
  holes: { holeNumber: number; par: number }[]
): number {
  return holes.reduce((sum, hole) => {
    const score = scores[hole.holeNumber] || 0;
    return sum + calculateNetScore(score, hole.par);
  }, 0);
}

export function formatNetScore(netScore: number): string {
  if (netScore === 0) return 'E';
  return netScore > 0 ? `+${netScore}` : `${netScore}`;
}