import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LeaderboardEntry } from '../models/user.model';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private apiUrl = environment.baseUrl + '/leaderboard';

  constructor(private http: HttpClient) {}

  getGlobalLeaderboard(): Observable<LeaderboardEntry[]> {
    return this.http.get<LeaderboardEntry[]>(`${this.apiUrl}/global`).pipe(
      catchError(error => {
        console.error('Error fetching leaderboard:', error);
        // Return mock data if API fails
        return of([]);
      })
    );
  }
  
  getCategoryLeaderboard(category: string): Observable<LeaderboardEntry[]> {
    return this.http.get<LeaderboardEntry[]>(`${this.apiUrl}/category/${category}`).pipe(
      catchError(error => {
        console.error(`Error fetching ${category} leaderboard:`, error);
        // Filter mock data based on category for demonstration
        return of([]);
      })
    );
  }
  
  getUserRank(userId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/rank/${userId}`).pipe(
      catchError(error => {
        console.error('Error fetching user rank:', error);
        return of(0); // Return 0 if API fails
      })
    );
  }
}