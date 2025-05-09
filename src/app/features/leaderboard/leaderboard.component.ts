import { Component, OnInit } from '@angular/core';
import { LeaderboardEntry } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { LeaderboardService } from '../../core/services/leaderboard.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss'
})
export class LeaderboardComponent implements OnInit {
  globalLeaderboard: LeaderboardEntry[] = [];
  easyLeaderboard: LeaderboardEntry[] = [];
  mediumLeaderboard: LeaderboardEntry[] = [];
  hardLeaderboard: LeaderboardEntry[] = [];
  
  currentLeaderboard: LeaderboardEntry[] = [];
  activeTab: string = 'global';
  
  constructor(
    private leaderboardService: LeaderboardService,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    this.loadGlobalLeaderboard();
    this.loadCategoryLeaderboard('EASY');
    this.loadCategoryLeaderboard('MEDIUM');
    this.loadCategoryLeaderboard('HARD');
  }
  
  loadGlobalLeaderboard(): void {
    this.leaderboardService.getGlobalLeaderboard().subscribe({
      next: (leaderboard) => {
        this.globalLeaderboard = leaderboard;
        this.currentLeaderboard = this.globalLeaderboard;
      },
      error: (error) => {
        console.error('Error loading global leaderboard:', error);
      }
    });
  }
  
  loadCategoryLeaderboard(category: string): void {
    this.leaderboardService.getCategoryLeaderboard(category).subscribe({
      next: (leaderboard) => {
        switch (category) {
          case 'EASY':
            this.easyLeaderboard = leaderboard;
            break;
          case 'MEDIUM':
            this.mediumLeaderboard = leaderboard;
            break;
          case 'HARD':
            this.hardLeaderboard = leaderboard;
            break;
        }
      },
      error: (error) => {
        console.error(`Error loading ${category} leaderboard:`, error);
      }
    });
  }
  
  setActiveTab(tab: string): void {
    this.activeTab = tab;
    
    switch (tab) {
      case 'global':
        this.currentLeaderboard = this.globalLeaderboard;
        break;
      case 'easy':
        this.currentLeaderboard = this.easyLeaderboard;
        break;
      case 'medium':
        this.currentLeaderboard = this.mediumLeaderboard;
        break;
      case 'hard':
        this.currentLeaderboard = this.hardLeaderboard;
        break;
    }
  }
  
  isCurrentUser(userId: number): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser ? currentUser.id === userId : false;
  }
  
  getRankClass(rank: number): string {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return 'rank-other';
  }
  
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }
}