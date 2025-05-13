export interface User {
  id: number;
  username: string;
  email: string;
  lastLogin: string;
}

export interface AuthResponse {
  data: Auth;
  error: string | null;
  message: string | null;
  status: boolean;
  statusCode: number;
  timestamp: string;
}

export interface Auth {
  token: string;
  user: User;
}

export interface LeaderboardEntry {
  userId: number;
  username: string;
  totalScore: number;
  totalTime: number;
  levelsCompleted: number;
}