/**
 * Calculate team handicap for Scramble format
 * In Scramble, the team handicap is calculated as:
 * 35% of the lowest handicap player + 15% of the highest handicap player
 * 
 * For single player teams, use the player's handicap directly
 */
export function calculateScrambleHandicap(playerHandicaps: (number | null | undefined)[]): number {
  // Filter out null/undefined values and ensure we have valid handicaps
  const validHandicaps = playerHandicaps.filter((h): h is number => 
    h !== null && h !== undefined && !isNaN(h)
  );
  
  console.log('Valid handicaps for scramble calculation:', validHandicaps);
  
  if (validHandicaps.length === 0) return 0;
  
  // For single player teams, use the player's handicap directly
  if (validHandicaps.length === 1) {
    console.log('Single player team, using handicap:', validHandicaps[0]);
    return validHandicaps[0];
  }
  
  // Sort handicaps from lowest to highest
  const sortedHandicaps = [...validHandicaps].sort((a, b) => a - b);
  
  // Get lowest and highest handicaps
  const lowestHandicap = sortedHandicaps[0];
  const highestHandicap = sortedHandicaps[sortedHandicaps.length - 1];
  
  console.log('Lowest handicap:', lowestHandicap, 'Highest handicap:', highestHandicap);
  
  // Calculate team handicap: 35% of lowest + 15% of highest
  const teamHandicap = (lowestHandicap * 0.35) + (highestHandicap * 0.15);
  console.log('Calculated scramble handicap (before rounding):', teamHandicap);
  
  // Round to nearest integer
  return Math.round(teamHandicap);
}

/**
 * Calculate team handicap based on game type
 */
export function calculateTeamHandicap(
  playerHandicaps: (number | null | undefined)[],
  gameType: 'scramble'
): number {
  console.log('Calculating team handicap for game type:', gameType);
  console.log('Player handicaps:', playerHandicaps);
  
  if (gameType === 'scramble') {
    return calculateScrambleHandicap(playerHandicaps);
  }
  
  return 0;
}