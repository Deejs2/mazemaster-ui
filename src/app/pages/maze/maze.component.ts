import { Component, HostListener, OnInit } from '@angular/core';
import { MazeResponse, PlayerProgress } from '../../models/maze.model';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from "../../components/navbar/navbar.component";

@Component({
  selector: 'app-maze',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './maze.component.html',
  styleUrl: './maze.component.scss'
})
export class MazeComponent implements OnInit {
  levelCategory = 'EASY';
  levelNumber = 1;
  maze: number[][] = [];
  loading = true;
  playerX = 0;
  playerY = 0;
  endX = 0;
  endY = 0;
  gameWon = false;
  score = 0;
  totalScore = 0;
  baseScore = 0;
  moves = 0;
  timer = 0;
  timerInterval: any;
  errorMessage = '';
  timerStarted = false;
  gameStarted = false;
  completedLevels: number[] = [];
  levelScores: { [key: number]: number } = {};

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadProgressFromStorage();
    this.loadMaze();
  }
  
  loadProgressFromStorage(): void {
    const savedProgress = localStorage.getItem('mazeGameProgress');
    if (savedProgress) {
      const progress: PlayerProgress = JSON.parse(savedProgress);
      this.completedLevels = progress.completedLevels || [];
      this.totalScore = progress.totalScore || 0;
      this.levelNumber = progress.currentLevel || 1;
      this.levelScores = progress.levelScores || {};
    }
  }
  
  saveProgressToStorage(): void {
    const progress: PlayerProgress = {
      completedLevels: this.completedLevels,
      totalScore: this.totalScore,
      currentLevel: this.levelNumber,
      levelScores: this.levelScores
    };
    localStorage.setItem('mazeGameProgress', JSON.stringify(progress));
  }

  loadMaze(): void {
    this.loading = true;
    this.gameWon = false;
    this.errorMessage = '';
    this.moves = 0;
    this.resetTimer();
    this.gameStarted = false;
    this.timerStarted = false;
    
    this.http.get<MazeResponse>(`http://localhost:8080/api/v1/maze/level?levelCategory=${this.levelCategory}&levelNumber=${this.levelNumber}`)
      .subscribe({
        next: (response) => {
          if (response.status && response.data && response.data.length > 0) {
            const mazeData = response.data[0];
            this.maze = mazeData.mazeData;
            this.playerX = mazeData.startX;
            this.playerY = mazeData.startY;
            this.endX = mazeData.endX;
            this.endY = mazeData.endY;
            this.baseScore = mazeData.baseScore;
            this.loading = false;
            
            // Reset level score if not already completed
            if (!this.isLevelCompleted(this.levelNumber)) {
              this.score = 0;
            } else {
              // If level was already completed, show previous score
              this.score = this.levelScores[this.levelNumber] || 0;
            }
          } else {
            this.errorMessage = 'No maze data found';
            this.loading = false;
          }
        },
        error: (error) => {
          this.errorMessage = 'Failed to load maze. Please try again.';
          this.loading = false;
          console.error('Error loading maze:', error);
        }
      });
  }
  
  isLevelCompleted(level: number): boolean {
    return this.completedLevels.includes(level);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (this.loading || this.gameWon) return;

    let newX = this.playerX;
    let newY = this.playerY;

    switch (event.key) {
      case 'ArrowUp':
        newX--;
        break;
      case 'ArrowDown':
        newX++;
        break;
      case 'ArrowLeft':
        newY--;
        break;
      case 'ArrowRight':
        newY++;
        break;
      default:
        return;
    }

    // Check if the move is valid (not going outside the maze or hitting a wall)
    if (this.isValidMove(newX, newY)) {
      // Start timer on first move
      if (!this.timerStarted) {
        this.startTimer();
        this.timerStarted = true;
        this.gameStarted = true;
      }
      
      this.playerX = newX;
      this.playerY = newY;
      this.moves++;
      this.checkWin();
    }
  }

  isValidMove(x: number, y: number): boolean {
    // Check if position is within maze boundaries
    if (x < 0 || x >= this.maze.length || y < 0 || y >= this.maze[0].length) {
      return false;
    }
    
    // Check if the position is a wall (1 represents wall)
    return this.maze[x][y] === 0;
  }

  checkWin(): void {
    if (this.playerX === this.endX && this.playerY === this.endY) {
      this.gameWon = true;
      this.stopTimer();
      this.calculateScore();
      
      // Mark level as completed if not already
      if (!this.isLevelCompleted(this.levelNumber)) {
        this.completedLevels.push(this.levelNumber);
        this.levelScores[this.levelNumber] = this.score;
        this.totalScore += this.score;
        this.saveProgressToStorage();
      }
    }
  }

  startTimer(): void {
    this.timer = 0;
    this.timerInterval = setInterval(() => {
      this.timer++;
    }, 1000);
  }

  stopTimer(): void {
    clearInterval(this.timerInterval);
  }

  resetTimer(): void {
    this.stopTimer();
    this.timer = 0;
    this.timerStarted = false;
  }

  calculateScore(): void {
    // Basic scoring: base score minus penalties for time and moves
    const timeBonus = Math.max(0, 100 - this.timer);
    const moveBonus = Math.max(0, 100 - (this.moves * 5));
    this.score = this.baseScore + timeBonus + moveBonus;
    
    // Store the score for this level
    this.levelScores[this.levelNumber] = this.score;
  }

  changeLevelNumber(change: number): void {
    const newLevel = this.levelNumber + change;
    
    // Check for valid level range
    if (newLevel < 1 || newLevel > 5) {
      return;
    }
    
    // Prevent going to next level if current level is not completed
    if (change > 0 && !this.isLevelCompleted(this.levelNumber) && !this.gameWon) {
      // Only block if trying to advance without completing current level
      alert('Please complete the current level first!');
      return;
    }
    
    this.levelNumber = newLevel;
    this.saveProgressToStorage();
    this.loadMaze();
  }
  
  resetProgress(): void {
    this.completedLevels = [];
    this.totalScore = 0;
    this.levelNumber = 1;
    this.levelScores = {};
    localStorage.removeItem('mazeGameProgress');
    this.loadMaze();
  }

  getCellClass(cell: number, rowIndex: number, colIndex: number): string {
    if (rowIndex === this.playerX && colIndex === this.playerY) {
      return 'player';
    }
    if (rowIndex === this.endX && colIndex === this.endY) {
      return 'end';
    }
    return cell === 1 ? 'wall' : 'path';
  }

  move(direction: string): void {
    if (this.loading || this.gameWon) return;

    let newX = this.playerX;
    let newY = this.playerY;

    switch (direction) {
      case 'up':
        newX--;
        break;
      case 'down':
        newX++;
        break;
      case 'left':
        newY--;
        break;
      case 'right':
        newY++;
        break;
    }

    if (this.isValidMove(newX, newY)) {
      // Start timer on first move
      if (!this.timerStarted) {
        this.startTimer();
        this.timerStarted = true;
        this.gameStarted = true;
      }
      
      this.playerX = newX;
      this.playerY = newY;
      this.moves++;
      this.checkWin();
    }
  }
  
  // Check if a specific level is accessible
  canAccessLevel(level: number): boolean {
    // Level 1 is always accessible
    if (level === 1) return true;
    
    // Other levels are accessible if the previous level is completed
    return this.isLevelCompleted(level - 1);
  }
}