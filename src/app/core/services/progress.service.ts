import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserProgress } from '../models/maze.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private apiUrl = 'http://localhost:8080/api/v1/progress';
  
  // For demonstration purposes, we'll store progress locally as well
  private progressKey = 'maze_master_progress';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  saveProgress(mazeId: number, score: number, time: number, bfsUsed: number): Observable<UserProgress> {
    const user = this.authService.getCurrentUser();
    
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
    
    return this.http.get<UserProgress[]>(`${this.apiUrl}/user/${user.id}`).pipe(
      catchError(error => {
        console.error('Error fetching progress:', error);
        return of(this.getLocalProgress());
      })
    );
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
      map(progress => progress.some(p => p.mazeId === mazeId))
    );
  }
  
  // Get the highest level completed in a category
  getHighestLevelCompleted(category: string): Observable<number> {
    return this.getUserProgress().pipe(
      map(progress => {
        // We would need to map mazeIds to categories here
        // For demo, assume mazeIds 1-5 are EASY, 6-10 are MEDIUM, 11-15 are HARD
        const categoryRanges = {
          'EASY': [1, 2, 3, 4, 5],
          'MEDIUM': [6, 7, 8, 9, 10],
          'HARD': [11, 12, 13, 14, 15]
        };
        
        const completedInCategory = progress
          .filter(p => categoryRanges[category as keyof typeof categoryRanges].includes(p.mazeId))
          .map(p => p.mazeId);
        
        if (completedInCategory.length === 0) {
          return 0;
        }
        
        // Return the level number (1-5) rather than maze ID
        return completedInCategory.length;
      })
    );
  }
}