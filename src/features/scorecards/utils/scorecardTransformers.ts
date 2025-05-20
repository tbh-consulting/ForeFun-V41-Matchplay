export function transformScores(scores: any[]): Record<string, Record<number, { 
  gross: number | null; 
  points: number | null;
  handicapStrokes: number;
}>> {
  const scoreMap: Record<string, Record<number, { 
    gross: number | null; 
    points: number | null;
    handicapStrokes: number;
  }>> = {};
  
  scores.forEach(score => {
    if (!scoreMap[score.player_id]) {
      scoreMap[score.player_id] = {};
    }
    
    // Ensure we have valid values for all properties
    scoreMap[score.player_id][score.hole_number] = {
      gross: score.gross_score,
      points: score.points,
      handicapStrokes: score.handicap_strokes || 0
    };
  });

  return scoreMap;
}

export function transformTeamScores(scores: any[]): Record<string, Record<number, { 
  gross: number | null; 
  points: number | null;
  handicapStrokes: number;
  matchPlayStatus?: number;
}>> {
  const scoreMap: Record<string, Record<number, { 
    gross: number | null; 
    points: number | null;
    handicapStrokes: number;
    matchPlayStatus?: number;
  }>> = {};
  
  scores.forEach(score => {
    if (!scoreMap[score.team_id]) {
      scoreMap[score.team_id] = {};
    }
    
    // Ensure we have valid values for all properties
    scoreMap[score.team_id][score.hole_number] = {
      gross: score.gross_score,
      points: score.points,
      handicapStrokes: score.handicap_strokes || 0,
      matchPlayStatus: score.match_play_status
    };
  });

  return scoreMap;
}