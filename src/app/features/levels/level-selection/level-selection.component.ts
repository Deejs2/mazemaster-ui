import { Component, OnInit } from '@angular/core';
import { Maze } from '../../../core/models/maze.model';
import { AuthService } from '../../../core/services/auth.service';
import { MazeService } from '../../../core/services/maze.service';
import { ProgressService } from '../../../core/services/progress.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LevelCardComponent } from '../level-card/level-card.component';

@Component({
  selector: 'app-level-selection',
  standalone: true,
  imports: [CommonModule, RouterLink, LevelCardComponent],
  templateUrl: './level-selection.component.html',
  styleUrl: './level-selection.component.scss'
})
export class LevelSelectionComponent implements OnInit {
  easyMazes: Maze[] = [];
  mediumMazes: Maze[] = [];
  hardMazes: Maze[] = [];
  
  isAuthenticated = false;
  
  highestLevelCompleted = {
    'EASY': 0,
    'MEDIUM': 0,
    'HARD': 0
  };
  
  constructor(
    private mazeService: MazeService,
    private progressService: ProgressService,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    
    // Load mazes by category
    this.loadMazesByCategory('EASY');
    this.loadMazesByCategory('MEDIUM');
    this.loadMazesByCategory('HARD');
    
    // Get user progress if authenticated
    if (this.isAuthenticated) {
      this.getHighestLevelCompleted('EASY');
      this.getHighestLevelCompleted('MEDIUM');
      this.getHighestLevelCompleted('HARD');
    }
  }
  
  loadMazesByCategory(category: string): void {
    this.mazeService.getMazesByCategory(category).subscribe({
      next: (mazes) => {
        switch (category) {
          case 'EASY':
            this.easyMazes = mazes;
            break;
          case 'MEDIUM':
            this.mediumMazes = mazes;
            break;
          case 'HARD':
            this.hardMazes = mazes;
            break;
        }
      },
      error: (error) => {
        console.error(`Error loading ${category} mazes:`, error);
        // Add some mock data for demonstration
        if (category === 'EASY') {
          this.addMockMazes('EASY', 5);
        } else if (category === 'MEDIUM') {
          this.addMockMazes('MEDIUM', 5);
        } else if (category === 'HARD') {
          this.addMockMazes('HARD', 5);
        }
      }
    });
  }
  
  getHighestLevelCompleted(category: string): void {
    this.progressService.getHighestLevelCompleted(category).subscribe({
      next: (level) => {
        this.highestLevelCompleted[category as keyof typeof this.highestLevelCompleted] = level;
      },
      error: (error) => {
        console.error(`Error getting highest level for ${category}:`, error);
      }
    });
  }
  
  // Mock data for demo purposes
  addMockMazes(category: string, count: number): void {
    const baseScore = category === 'EASY' ? 100 : (category === 'MEDIUM' ? 200 : 300);
    const mazes: Maze[] = [];
    
    for (let i = 1; i <= count; i++) {
      const maze: Maze = {
        id: category === 'EASY' ? i : (category === 'MEDIUM' ? i + 5 : i + 10),
        levelCategory: category as 'EASY' | 'MEDIUM' | 'HARD',
        levelNumber: i,
        mazeData: [],  // Simplified for mock
        startX: 1,
        startY: 1,
        endX: 3,
        endY: 3,
        baseScore: baseScore + (i * 10)
      };
      
      mazes.push(maze);
    }
    
    switch (category) {
      case 'EASY':
        this.easyMazes = mazes;
        break;
      case 'MEDIUM':
        this.mediumMazes = mazes;
        break;
      case 'HARD':
        this.hardMazes = mazes;
        break;
    }
  }
}