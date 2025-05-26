import { Component, OnInit } from '@angular/core';
import { LeaderboardEntry } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { LeaderboardService } from '../../core/services/leaderboard.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss'
})
export class LeaderboardComponent implements OnInit {
  // Leaderboard data
  globalLeaderboard: LeaderboardEntry[] = [];
  easyLeaderboard: LeaderboardEntry[] = [];
  mediumLeaderboard: LeaderboardEntry[] = [];
  hardLeaderboard: LeaderboardEntry[] = [];

  currentLeaderboard: LeaderboardEntry[] = [];
  filteredData: LeaderboardEntry[] = [];
  paginatedData: LeaderboardEntry[] = [];

  // UI state
  activeTab: string = 'global';
  searchTerm: string = '';
  currentSort: string = 'Rank';
  sortDirection: 'asc' | 'desc' = 'asc';
  sortField: string = 'rank';

  // Pagination
  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;

  // User data
  userMap: { [key: number]: string } = {};

  // Loading state
  isLoading: boolean = false;

  // Math reference for template
  Math = Math;

  constructor(
    private leaderboardService: LeaderboardService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAllLeaderboards();
  }

  // Data loading methods
  loadAllLeaderboards(): void {
    this.isLoading = true;
    this.loadGlobalLeaderboard();
    this.loadCategoryLeaderboard('EASY');
    this.loadCategoryLeaderboard('MEDIUM');
    this.loadCategoryLeaderboard('HARD');
  }

  loadGlobalLeaderboard(): void {
    this.leaderboardService.getGlobalLeaderboard().subscribe({
      next: (leaderboard: any) => {
        this.globalLeaderboard = leaderboard.data.content;
        this.currentLeaderboard = this.globalLeaderboard;
        this.preloadUsernames(this.globalLeaderboard);
        this.updateDisplayData();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading global leaderboard:', error);
        this.isLoading = false;
      }
    });
  }

  loadCategoryLeaderboard(category: string): void {
    this.leaderboardService.getCategoryLeaderboard(category).subscribe({
      next: (leaderboard: any) => {
        const content = leaderboard.data.content;
        switch (category) {
          case 'EASY':
            this.easyLeaderboard = content;
            break;
          case 'MEDIUM':
            this.mediumLeaderboard = content;
            break;
          case 'HARD':
            this.hardLeaderboard = content;
            break;
        }
        this.preloadUsernames(content);
      },
      error: (error) => {
        console.error(`Error loading ${category} leaderboard:`, error);
      }
    });
  }

  preloadUsernames(entries: LeaderboardEntry[]): void {
    entries.forEach(entry => {
      if (!this.userMap[entry.userId]) {
        this.authService.getUserById(entry.userId).subscribe({
          next: (response: any) => {
            this.userMap[entry.userId] = response.data.username;
          },
          error: () => {
            this.userMap[entry.userId] = 'Unknown Player';
          }
        });
      }
    });
  }

  // Tab management
  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.currentPage = 0;

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
    
    this.updateDisplayData();
  }

  // Search functionality
  onSearch(): void {
    this.currentPage = 0;
    this.updateDisplayData();
  }

  // Sorting functionality
  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    
    this.currentSort = this.capitalize(field);
    this.updateDisplayData();
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) {
      return 'bi-arrow-down-up';
    }
    return this.sortDirection === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down';
  }

  // Pagination functionality
  onPageSizeChange(): void {
    this.currentPage = 0;
    this.updateDisplayData();
  }

  nextPage(): void {
    if (this.currentPage < this.getTotalPages() - 1) {
      this.currentPage++;
      this.updateDisplayData();
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updateDisplayData();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.updateDisplayData();
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredData.length / this.pageSize);
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(0, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // Data processing
  updateDisplayData(): void {
    // Apply search filter
    this.filteredData = this.currentLeaderboard.filter(entry => {
      if (!this.searchTerm) return true;
      
      const username = this.userMap[entry.userId]?.toLowerCase() || '';
      const searchLower = this.searchTerm.toLowerCase();
      
      return username.includes(searchLower) ||
             entry.totalScore.toString().includes(searchLower) ||
             entry.levelsCompleted.levelCategory.toLowerCase().includes(searchLower);
    });

    // Apply sorting
    this.filteredData.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (this.sortField) {
        case 'rank':
          aValue = a.globalRank || 999999;
          bValue = b.globalRank || 999999;
          break;
        case 'player':
          aValue = this.userMap[a.userId] || 'Unknown';
          bValue = this.userMap[b.userId] || 'Unknown';
          break;
        case 'score':
          aValue = a.totalScore;
          bValue = b.totalScore;
          break;
        case 'time':
          aValue = a.totalTime;
          bValue = b.totalTime;
          break;
        case 'levels':
          aValue = `${a.levelsCompleted.levelCategory}${a.levelsCompleted.levelNumber}`;
          bValue = `${b.levelsCompleted.levelCategory}${b.levelsCompleted.levelNumber}`;
          break;
        default:
          return 0;
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (this.sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    // Apply pagination
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedData = this.filteredData.slice(startIndex, endIndex);
  }

  // Utility methods
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

  getLevelBadgeClass(category: string): string {
    switch (category.toLowerCase()) {
      case 'easy':
        return 'badge bg-success';
      case 'medium':
        return 'badge bg-warning text-dark';
      case 'hard':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

  formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  trackByUserId(index: number, entry: LeaderboardEntry): number {
    return entry.userId;
  }

  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Statistics methods
  getTotalPlayers(): number {
    return this.currentLeaderboard.length;
  }

  getAverageScore(): number {
    if (this.currentLeaderboard.length === 0) return 0;
    const total = this.currentLeaderboard.reduce((sum, entry) => sum + entry.totalScore, 0);
    return Math.round(total / this.currentLeaderboard.length);
  }

  getBestTime(): string {
    if (this.currentLeaderboard.length === 0) return '0:00';
    const bestTime = Math.min(...this.currentLeaderboard.map(entry => entry.totalTime));
    return this.formatTime(bestTime);
  }

  // Action methods
  viewProfile(userId: number): void {
    // Implement profile viewing logic
    console.log('View profile for user:', userId);
    this.router.navigate(['/profile', userId]);
  }

  refreshLeaderboard(): void {
    this.isLoading = true;
    this.loadAllLeaderboards();
  }
}