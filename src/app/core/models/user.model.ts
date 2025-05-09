export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  lastLogin: string;
}

export interface AuthResponse {
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