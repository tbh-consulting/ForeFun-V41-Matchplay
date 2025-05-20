export interface PlayerRanking {
  id: string;
  username: string;
  avatarUrl: string | null;
  relativeScore: number;
  scorecardId: string;
  position?: number; // Add position field
}

export interface CourseRanking {
  courseId: string;
  courseName: string;
  rankings: PlayerRanking[];
  userRanking?: PlayerRanking; // Add user's ranking if not in top 3
}