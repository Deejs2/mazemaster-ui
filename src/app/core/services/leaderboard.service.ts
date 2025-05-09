import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LeaderboardEntry } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private apiUrl = 'http://localhost:8080/api/v1/leaderboard';
  
  // Mock data for demonstration
  private mockLeaderboard: LeaderboardEntry[] = [
    { userId: 1, username: 'PathMaster', totalScore: 2480, totalTime: 750, levelsCompleted: 15 },
    { userId: 2, username: 'MazeRunner', totalScore: 2350, totalTime: 820, levelsCompleted: 15 },
    { userId: 3, username: 'AlgoWhiz', totalScore: 2180, totalTime: 900, levelsCompleted: 14 },
    { userId: 4, username: 'CodeNinja', totalScore: 2050, totalTime: 1100, levelsCompleted: 13 },
    { userId: 5, username: 'PixelExplorer', totalScore: 1920, totalTime: 1200, levelsCompleted: 12 },
    { userId: 6, username: 'GraphTraverser', totalScore: 1750, totalTime: 1350, levelsCompleted: 11 },
    { userId: 7, username: 'NodeHunter', totalScore: 1680, totalTime: 1420, levelsCompleted: 10 },
    { userId: 8, username: 'QueueMaster', totalScore: 1550, totalTime: 1500, levelsCompleted: 9 },
    { userId: 9, username: 'BFSChampion', totalScore: 1320, totalTime: 1680, levelsCompleted: 8 },
    { userId: 10, username: 'PathFinder', totalScore: 1100, totalTime: 1820, levelsCompleted: 7 }
  ];

  constructor(private http: HttpClient) {}

  getGlobalLeaderboard(): Observable<LeaderboardEntry[]> {
    return this.http.get<LeaderboardEntry[]>(`${this.apiUrl}/global`).pipe(
      catchError(error => {
        console.error('Error fetching leaderboard:', error);
        // Return mock data if API fails
        return of(this.mockLeaderboard);
      })
    );
  }
  
  getCategoryLeaderboard(category: string): Observable<LeaderboardEntry[]> {
    return this.http.get<LeaderboardEntry[]>(`${this.apiUrl}/category/${category}`).pipe(
      catchError(error => {
        console.error(`Error fetching ${category} leaderboard:`, error);
        // Filter mock data based on category for demonstration
        return of(this.mockLeaderboard.slice(0, 5));
      })
    );
  }
  
  getUserRank(userId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/rank/${userId}`).pipe(
      catchError(error => {
        console.error('Error fetching user rank:', error);
        // Simulate rank for demo
        const userIndex = this.mockLeaderboard.findIndex(entry => entry.userId === userId);
        return of(userIndex >= 0 ? userIndex + 1 : 99);
      })
    );
  }
}