export function calculateHandicapStrokes(
  playerHandicap: number | null,
  holeHandicap: number | null,
  totalHoles: number = 18
): number {
  if (!playerHandicap || !holeHandicap) return 0;
  
  // For handicaps above 36, give 2 strokes per hole
  if (playerHandicap >= 36) return 2;

  // Calculate base strokes (1 stroke if handicap >= SI)
  const baseStrokes = playerHandicap >= holeHandicap ? 1 : 0;
  
  // Add extra stroke if handicap is high enough
  let extraStroke = 0;
  if (playerHandicap > 18) {
    // Calculate how many holes get an extra stroke
    // Example: handicap 24 means SI 1-6 get an extra stroke
    const remainingHandicap = playerHandicap - 18;
    if (holeHandicap <= remainingHandicap) {
      extraStroke = 1;
    }
  }
  
  return baseStrokes + extraStroke;
}

// Calculate handicap strokes for a team
export function calculateTeamHandicapStrokes(
  teamHandicap: number | null,
  holeHandicap: number | null,
  totalHoles: number = 18
): number {
  return calculateHandicapStrokes(teamHandicap, holeHandicap, totalHoles);
}