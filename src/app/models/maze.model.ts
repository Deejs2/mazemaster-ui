export interface MazeLevel {
    id: string;
    levelNumber: number;
    levelCategory: string;
    baseScore: number;
    mazeData: number[][];
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  }
  
  export interface Position {
    row: number;
    col: number;
  }
  
  export interface MazeResponse {
    data: MazeLevel[];
    message: string;
    success: boolean;
  }