export type WeatherCondition = 'sunny' | 'cloudy' | 'partly_cloudy' | 'rainy' | 'windy';
export type GameType = 'strokeplay' | 'scramble' | '4ball';

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
}

export interface Player {
  id: string;
  username: string;
  avatarUrl?: string | null;
  handicap?: number | null;
  relativeScore?: number | null;
  points?: number | null;
  teamId?: string | null;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
  handicap: number | null;
  totalGrossScore?: number;
  totalPoints?: number;
  relativeScore?: number;
  completedHoles?: number;
  matchPlayTotal?: number;
}

export interface Scorecard {
  id: string;
  courseId: string;
  courseName: string;
  createdBy: string;
  date: Date;
  weather: WeatherCondition;
  gameType: GameType;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  players: Player[];
  teams?: Team[];
  userRelativeScore?: number | null;
  userPoints?: number | null;
  userTeam?: Team | null;
}

export interface NewScorecard {
  courseId: string;
  createdBy: string;
  date: Date;
  weather: WeatherCondition;
  gameType: GameType;
  players?: string[];
  teams?: {
    name: string;
    playerIds: string[];
  }[];
}

export interface CourseHole {
  id: string;
  holeNumber: number;
  par: number;
  handicap: number | null;
  distanceBlackMeters: number | null;
  distanceWhiteMeters: number | null;
  distanceYellowMeters: number | null;
  distanceBlueMeters: number | null;
  distanceRedMeters: number | null;
}

export interface ScorecardPlayer {
  id: string;
  username: string;
  avatarUrl?: string | null;
  handicap?: number | null;
  teamId?: string | null;
}

export interface TeamScore {
  id: string;
  teamId: string;
  holeNumber: number;
  grossScore: number | null;
  points: number | null;
  handicapStrokes: number;
  holePar: number;
  holeSI: number | null;
  matchPlayStatus?: number;
}