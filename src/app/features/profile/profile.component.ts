import { Component, OnInit } from '@angular/core';
import { UserProgress } from '../../core/models/maze.model';
import { User } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { LeaderboardService } from '../../core/services/leaderboard.service';
import { ProgressService } from '../../core/services/progress.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  userProgress: UserProgress[] = [];
  userRank: number = 0;
  
  constructor(
    private authService: AuthService,
    private progressService: ProgressService,
    private leaderboardService: LeaderboardService
  ) {}
  
  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    
    if (this.user) {
      this.loadUserProgress();
      this.loadUserRank();
    }
  }
  
  loadUserProgress(): void {
    this.progressService.getUserProgress().subscribe({
      next: (progress) => {
        this.userProgress = progress;
      },
      error: (error) => {
        console.error('Error loading user progress:', error);
        
        // Mock progress for demo
        this.addMockProgress();
      }
    });
  }
  
  loadUserRank(): void {
    if (!this.user) return;
    
    this.leaderboardService.getUserRank(this.user.id).subscribe({
      next: (rank) => {
        this.userRank = rank;
      },
      error: (error) => {
        console.error('Error loading user rank:', error);
        this.userRank = Math.floor(Math.random() * 20) + 1; // Mock rank between 1-20
      }
    });
  }
  
  getTotalScore(): number {
    return this.userProgress.reduce((total, progress) => total + progress.bestScore, 0);
  }
  
  getCompletedCountByCategory(category: string): number {
    // Assuming mazeIds: 1-5 are EASY, 6-10 are MEDIUM, 11-15 are HARD
    const categoryRanges = {
      'EASY': [1, 2, 3, 4, 5],
      'MEDIUM': [6, 7, 8, 9, 10],
      'HARD': [11, 12, 13, 14, 15]
    };
    
    return this.userProgress
      .filter(p => categoryRanges[category as keyof typeof categoryRanges].includes(p.mazeId))
      .length;
  }
  
  getCompletionPercentage(category: string): number {
    const completed = this.getCompletedCountByCategory(category);
    const total = 5; // 5 levels per category
    
    return Math.round((completed / total) * 100);
  }
  
  formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
  
  getLevelInfo(mazeId: number): { category: string, levelNumber: number } {
    // Map maze IDs to categories and levels
    if (mazeId >= 1 && mazeId <= 5) {
      return { category: 'EASY', levelNumber: mazeId };
    } else if (mazeId >= 6 && mazeId <= 10) {
      return { category: 'MEDIUM', levelNumber: mazeId - 5 };
    } else {
      return { category: 'HARD', levelNumber: mazeId - 10 };
    }
  }
  
  // Add mock progress for demo
  addMockProgress(): void {
    const mockProgress: UserProgress[] = [
      {
        mazeId: 1,
        bestScore: 95,
        completionTime: 45000,
        bfsUsed: 1,
        attempts: 2,
        lastAttempt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        mazeId: 2,
        bestScore: 120,
        completionTime: 60000,
        bfsUsed: 0,
        attempts: 1,
        lastAttempt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        mazeId: 3,
        bestScore: 110,
        completionTime: 75000,
        bfsUsed: 2,
        attempts: 3,
        lastAttempt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        mazeId: 6,
        bestScore: 180,
        completionTime: 120000,
        bfsUsed: 1,
        attempts: 2,
        lastAttempt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        mazeId: 11,
        bestScore: 250,
        completionTime: 180000,
        bfsUsed: 3,
        attempts: 5,
        lastAttempt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    this.userProgress = mockProgress;
  }
}