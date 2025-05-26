import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserProgress } from '../models/maze.model';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private apiUrl = environment.baseUrl+'/user-progress';
  private userProgressUrl = environment.baseUrl+'/public/user-progress';

  
  // For demonstration purposes, we'll store progress locally as well
  private progressKey = 'maze_master_progress';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  saveProgress(mazeId: number, score: number, time: number, bfsUsed: number): Observable<UserProgress> {
    const user = this.authService.getCurrentUser();
    console.log('Saving progress for user:', user);

    if (!user) {
      return of({ mazeId, bestScore: score, completionTime: time, bfsUsed, attempts: 1, lastAttempt: new Date().toISOString() });
    }
    
    const payload = {
      userId: user.id,
      mazeId,
      score,
      completionTime: time,
      bfsUsed
    };
    
    return this.http.post<UserProgress>(`${this.apiUrl}/save`, payload).pipe(
      catchError(error => {
        console.error('Error saving progress:', error);
        // Save locally as fallback
        this.saveProgressLocally(mazeId, score, time, bfsUsed);
        return of({ mazeId, bestScore: score, completionTime: time, bfsUsed, attempts: 1, lastAttempt: new Date().toISOString() });
      })
    );
  }

  getUserProgress(): Observable<UserProgress[]> {
    const user = this.authService.getCurrentUser();

    if (!user) {
      return of(this.getLocalProgress());
    }

    return this.http.get<any>(`${this.apiUrl}/${user.id}`).pipe(
      map(response => {
        const progress = response.data ?? [];
        localStorage.setItem(this.progressKey, JSON.stringify(progress));
        console.log('Fetched progress:', progress);
        return progress;
      }),
      catchError(error => {
        console.error('Error fetching progress:', error);
        return of(this.getLocalProgress());
      })
    );
  }

  getUserProgressByUserId(userId: number): Observable<UserProgress[]> {
    return this.http.get<any>(`${this.userProgressUrl}/${userId}`);
  }

  // Local storage methods for offline/demo functionality
  private saveProgressLocally(mazeId: number, score: number, time: number, bfsUsed: number): void {
    const existingProgress = this.getLocalProgress();
    const existingEntryIndex = existingProgress.findIndex(p => p.mazeId === mazeId);
    
    const newEntry: UserProgress = {
      mazeId,
      bestScore: score,
      completionTime: time,
      bfsUsed,
      attempts: 1,
      lastAttempt: new Date().toISOString()
    };
    
    if (existingEntryIndex >= 0) {
      const existingEntry = existingProgress[existingEntryIndex];
      
      // Update only if new score is better
      if (score > existingEntry.bestScore) {
        existingEntry.bestScore = score;
        existingEntry.completionTime = time;
        existingEntry.bfsUsed = bfsUsed;
      }
      
      existingEntry.attempts += 1;
      existingEntry.lastAttempt = new Date().toISOString();
      
      existingProgress[existingEntryIndex] = existingEntry;
    } else {
      existingProgress.push(newEntry);
    }
    
    localStorage.setItem(this.progressKey, JSON.stringify(existingProgress));
  }

  private getLocalProgress(): UserProgress[] {
    const progressJson = localStorage.getItem(this.progressKey);
    
    if (!progressJson) {
      return [];
    }
    
    try {
      return JSON.parse(progressJson);
    } catch (e) {
      return [];
    }
  }
  
  // Check if player has completed a level
  hasCompletedLevel(mazeId: number): Observable<boolean> {
    return this.getUserProgress().pipe(
      map(progress => Array.isArray(progress) ? progress.some(p => p.mazeId === mazeId) : false)
    );
  }
  
  // Get the highest level completed in a category
  getHighestLevelCompleted(category: string): Observable<number> {
  return this.http.get<any>(`${this.apiUrl}/highest-level?category=${category}`).pipe(
    map(response => {
      // Ensure the response contains the expected data
      if (response && response.status && response.data && response.data.highestLevel !== undefined) {
        return response.data.highestLevel; // Extract the highest level
      } else {
        console.error(`Unexpected response format for category ${category}:`, response);
        return 0; // Default to 0 if the response is invalid
      }
    }),
    catchError(error => {
      console.error(`Error fetching highest level for category ${category}:`, error);
      return of(0); // Return 0 in case of an error
    })
  );
}
}