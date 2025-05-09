export interface MazeResponse {
  status: boolean;
  statusCode: number;
  timestamp: string;
  message: string;
  data: MazeData[];
  error: any;
}

export interface MazeData {
  id: number;
  levelCategory: string;
  levelNumber: number;
  mazeData: number[][];
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  baseScore: number;
}

export interface PlayerProgress {
  completedLevels: number[];
  totalScore: number;
  currentLevel: number;
  levelScores: { [key: number]: number };
}