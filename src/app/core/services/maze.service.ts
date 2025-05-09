import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiResponse, Maze, PlayerPosition, MazeCell } from '../models/maze.model';

@Injectable({
  providedIn: 'root'
})
export class MazeService {
  private apiUrl = 'http://localhost:8080/api/v1/maze';

  constructor(private http: HttpClient) {}

  getMazesByCategory(category: string): Observable<Maze[]> {
    return this.http.get<ApiResponse<Maze>>(`${this.apiUrl}?levelCategory=${category}`).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error fetching mazes:', error);
        return throwError(() => new Error('Failed to load mazes'));
      })
    );
  }

  getMazeByLevel(category: string, level: number): Observable<Maze> {
    return this.http.get<ApiResponse<Maze>>(`${this.apiUrl}/level?levelCategory=${category}&levelNumber=${level}`).pipe(
      map(response => {
        if (response.data && response.data.length > 0) {
          return response.data[0];
        }
        throw new Error('Maze not found');
      }),
      catchError(error => {
        console.error('Error fetching maze:', error);
        return throwError(() => new Error('Failed to load maze'));
      })
    );
  }

  // Convert maze data to cell representation for the game board
  convertMazeDataToCells(maze: Maze): MazeCell[][] {
    const cells: MazeCell[][] = [];
    
    for (let y = 0; y < maze.mazeData.length; y++) {
      cells[y] = [];
      for (let x = 0; x < maze.mazeData[y].length; x++) {
        cells[y][x] = {
          x,
          y,
          isWall: maze.mazeData[y][x] === 1,
          isStart: x === maze.startX && y === maze.startY,
          isEnd: x === maze.endX && y === maze.endY,
          isPlayer: x === maze.startX && y === maze.startY,
          isVisited: false,
          isSolution: false
        };
      }
    }
    
    return cells;
  }

  // Implement BFS algorithm for pathfinding
  findPathBFS(maze: MazeCell[][], start: PlayerPosition, end: PlayerPosition): PlayerPosition[] {
    const directions = [
      { x: 0, y: -1 }, // up
      { x: 1, y: 0 },  // right
      { x: 0, y: 1 },  // down
      { x: -1, y: 0 }  // left
    ];
    
    const queue: PlayerPosition[] = [start];
    const visited: boolean[][] = [];
    const parent: Map<string, PlayerPosition> = new Map();
    
    // Initialize visited array
    for (let y = 0; y < maze.length; y++) {
      visited[y] = [];
      for (let x = 0; x < maze[y].length; x++) {
        visited[y][x] = false;
      }
    }
    
    visited[start.y][start.x] = true;
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      
      // If we reached the end
      if (current.x === end.x && current.y === end.y) {
        // Reconstruct path
        const path: PlayerPosition[] = [];
        let curr: PlayerPosition = end;
        
        while (curr.x !== start.x || curr.y !== start.y) {
          path.unshift(curr);
          const key = `${curr.x},${curr.y}`;
          curr = parent.get(key)!;
        }
        
        path.unshift(start);
        return path;
      }
      
      // Check all four directions
      for (const dir of directions) {
        const newX = current.x + dir.x;
        const newY = current.y + dir.y;
        
        // Check if valid position
        if (
          newX >= 0 && newX < maze[0].length &&
          newY >= 0 && newY < maze.length &&
          !maze[newY][newX].isWall &&
          !visited[newY][newX]
        ) {
          const next: PlayerPosition = { x: newX, y: newY };
          queue.push(next);
          visited[newY][newX] = true;
          parent.set(`${newX},${newY}`, current);
        }
      }
    }
    
    // No path found
    return [];
  }
  
  // Calculate score based on time, maze difficulty, and BFS usage
  calculateScore(baseScore: number, timeElapsed: number, bfsUsed: number): number {
    // Time penalty: 1 point per second
    const timePenalty = Math.floor(timeElapsed / 1000);
    
    // BFS penalty: 10% of base score per use
    const bfsPenalty = baseScore * 0.1 * bfsUsed;
    
    // Calculate final score
    let finalScore = baseScore - timePenalty - bfsPenalty;
    
    // Ensure score is never negative
    return Math.max(0, Math.floor(finalScore));
  }
}