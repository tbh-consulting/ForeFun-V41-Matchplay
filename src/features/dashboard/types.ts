export interface FriendActivity {
  id: string;
  scorecardId: string;
  date: string;
  courseName: string;
  relativeScore: number;
  completedHoles: number;
  points: number;
  gameType?: string;
  matchPlayTotal?: number;
  user: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
  isOwnActivity: boolean;
  isTeam?: boolean;
  teamId?: string;
  likes: string[];
  comments: {
    id: string;
    content: string;
    createdAt: string;
    user: {
      id: string;
      username: string;
      avatarUrl: string | null;
    };
  }[];
}