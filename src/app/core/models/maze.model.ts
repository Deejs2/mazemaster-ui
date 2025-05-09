export interface Maze {
  id: number;
  levelCategory: 'EASY' | 'MEDIUM' | 'HARD';
  levelNumber: number;
  mazeData: number[][];
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  baseScore: number;
}

export interface ApiResponse<T> {
  status: boolean;
  statusCode: number;
  timestamp: string;
  message: string;
  data: T[];
  error: any;
}

export interface MazeCell {
  x: number;
  y: number;
  isWall: boolean;
  isStart: boolean;
  isEnd: boolean;
  isPlayer: boolean;
  isVisited: boolean;
  isSolution: boolean;
}

export interface PlayerPosition {
  x: number;
  y: number;
}

export interface GameState {
  maze: MazeCell[][];
  playerPosition: PlayerPosition;
  timeElapsed: number;
  score: number;
  bfsUsed: number;
  isCompleted: boolean;
  path: PlayerPosition[];
}

export interface UserProgress {
  mazeId: number;
  bestScore: number;
  completionTime: number;
  bfsUsed: number;
  attempts: number;
  lastAttempt: string;
}