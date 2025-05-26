import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, interval, takeUntil } from 'rxjs';
import { Maze, GameState, PlayerPosition } from '../../../core/models/maze.model';
import { AuthService } from '../../../core/services/auth.service';
import { MazeService } from '../../../core/services/maze.service';
import { ProgressService } from '../../../core/services/progress.service';
import { GameInfoComponent } from '../game-info/game-info.component';
import { LevelCompletedComponent } from '../level-completed/level-completed.component';
import { MazeCellComponent } from '../maze-cell/maze-cell.component';
import { GameControlComponent } from '../game-control/game-control.component';
@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [CommonModule, MazeCellComponent, GameControlComponent, GameInfoComponent, LevelCompletedComponent],
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.scss'
})
export class GameBoardComponent implements OnInit, OnDestroy {
  levelCategory: string = '';
  levelNumber: number = 0;
  maze?: Maze;
  gameState!: GameState;
  loading: boolean = true;
  
  maxBfsUses: number = 3;
  startTime: number = 0;
  
  private destroy$ = new Subject<void>();
  private timerSubscription: any;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mazeService: MazeService,
    private progressService: ProgressService,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
  this.route.params.subscribe(params => {
    this.levelCategory = params['category'].toUpperCase();
    this.levelNumber = +params['level'];

    // Prevent unauthenticated users from accessing MEDIUM or HARD
    if (!this.authService.isAuthenticated() && this.levelCategory !== 'EASY') {
      alert('Please register or login to play Medium and Hard levels!');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.loadMaze();
  });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }
  
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (!this.gameState || this.gameState.isCompleted) {
      return;
    }
    
    switch (event.key) {
      case 'ArrowUp':
        this.movePlayer('up');
        event.preventDefault();
        break;
      case 'ArrowRight':
        this.movePlayer('right');
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.movePlayer('down');
        event.preventDefault();
        break;
      case 'ArrowLeft':
        this.movePlayer('left');
        event.preventDefault();
        break;
      case 'b': // Shortcut for BFS
        this.showBFSPath();
        event.preventDefault();
        break;
    }
  }
  
  loadMaze(): void {
    this.loading = true;
    
    this.mazeService.getMazeByLevel(this.levelCategory, this.levelNumber).subscribe({
      next: (maze) => {
        this.maze = maze;
        this.initializeGameState();
        this.startTimer();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading maze:', error);
        // For demo, create a mock maze
        this.createMockMaze();
        this.loading = false;
      }
    });
  }
  
  createMockMaze(): void {
    const size = this.levelCategory === 'EASY' ? 5 + this.levelNumber :
                 this.levelCategory === 'MEDIUM' ? 8 + this.levelNumber :
                 10 + this.levelNumber;
    
    // Create a simplified maze for demo
    const mazeData: number[][] = [];
    for (let y = 0; y < size; y++) {
      mazeData[y] = [];
      for (let x = 0; x < size; x++) {
        // Walls around the edges
        if (y === 0 || y === size - 1 || x === 0 || x === size - 1) {
          mazeData[y][x] = 1; // Wall
        }
        // Random walls inside
        else if (Math.random() < 0.2) {
          mazeData[y][x] = 1; // Wall
        }
        else {
          mazeData[y][x] = 0; // Path
        }
      }
    }
    
    // Ensure start and end are paths
    const startX = 1;
    const startY = 1;
    const endX = size - 2;
    const endY = size - 2;
    
    mazeData[startY][startX] = 0;
    mazeData[endY][endX] = 0;
    
    // Ensure there's a path from start to end (simple approach)
    for (let i = startX; i <= endX; i++) {
      mazeData[startY][i] = 0;
    }
    for (let i = startY; i <= endY; i++) {
      mazeData[i][endX] = 0;
    }
    
    this.maze = {
      id: this.levelNumber,
      levelCategory: this.levelCategory as 'EASY' | 'MEDIUM' | 'HARD',
      levelNumber: this.levelNumber,
      mazeData,
      startX,
      startY,
      endX,
      endY,
      baseScore: this.levelCategory === 'EASY' ? 100 + (this.levelNumber * 10) :
                 this.levelCategory === 'MEDIUM' ? 200 + (this.levelNumber * 15) :
                 300 + (this.levelNumber * 20)
    };
    
    this.initializeGameState();
    this.startTimer();
  }
  
  initializeGameState(): void {
    if (!this.maze) return;
    
    const mazeCells = this.mazeService.convertMazeDataToCells(this.maze);
    
    this.gameState = {
      maze: mazeCells,
      playerPosition: { x: this.maze.startX, y: this.maze.startY },
      timeElapsed: 0,
      score: 0,
      bfsUsed: 0,
      isCompleted: false,
      path: []
    };
    
    this.startTime = Date.now();
  }
  
  startTimer(): void {
    this.timerSubscription = interval(100)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.gameState && !this.gameState.isCompleted) {
          this.gameState.timeElapsed = Date.now() - this.startTime;
          
          // Update score based on time
          if (this.maze) {
            this.gameState.score = this.mazeService.calculateScore(
              this.maze.baseScore,
              this.gameState.timeElapsed,
              this.gameState.bfsUsed
            );
          }
        }
      });
  }
  
  movePlayer(direction: 'up' | 'right' | 'down' | 'left'): void {
    if (!this.gameState || this.gameState.isCompleted) return;
    
    const { x, y } = this.gameState.playerPosition;
    let newX = x;
    let newY = y;
    
    switch (direction) {
      case 'up':
        newY = y - 1;
        break;
      case 'right':
        newX = x + 1;
        break;
      case 'down':
        newY = y + 1;
        break;
      case 'left':
        newX = x - 1;
        break;
    }
    
    // Check if new position is valid
    if (
      newY >= 0 && newY < this.gameState.maze.length &&
      newX >= 0 && newX < this.gameState.maze[0].length &&
      !this.gameState.maze[newY][newX].isWall
    ) {
      // Update old position
      this.gameState.maze[y][x].isPlayer = false;
      
      // Mark as visited
      this.gameState.maze[y][x].isVisited = true;
      
      // Update new position
      this.gameState.maze[newY][newX].isPlayer = true;
      this.gameState.playerPosition = { x: newX, y: newY };
      
      // Clear any previous solution path
      this.clearSolutionPath();
      
      // Check if player reached the end
      if (this.maze && newX === this.maze.endX && newY === this.maze.endY) {
        this.completeLevel();
      }
    }
  }
  
  showBFSPath(): void {
    if (!this.gameState || !this.maze || this.gameState.isCompleted) return;
    
    // Check if BFS uses are depleted
    if (this.gameState.bfsUsed >= this.maxBfsUses) {
      return;
    }
    
    // Clear any previous solution path
    this.clearSolutionPath();
    
    // Find path using BFS
    const endPosition: PlayerPosition = { x: this.maze.endX, y: this.maze.endY };
    const path = this.mazeService.findPathBFS(
      this.gameState.maze,
      this.gameState.playerPosition,
      endPosition
    );
    
    // If path found, visualize it
    if (path.length > 0) {
      // Skip the first position (current player position)
      this.gameState.path = path.slice(1);
      
      // Mark cells in path as solution
      for (const pos of this.gameState.path) {
        this.gameState.maze[pos.y][pos.x].isSolution = true;
      }
      
      // Increment BFS usage
      this.gameState.bfsUsed++;
    }
  }
  
  clearSolutionPath(): void {
    if (!this.gameState) return;
    
    // Clear solution path
    for (const pos of this.gameState.path) {
      this.gameState.maze[pos.y][pos.x].isSolution = false;
    }
    
    this.gameState.path = [];
  }
  
  completeLevel(): void {
    if (!this.gameState || !this.maze) return;
    
    this.gameState.isCompleted = true;
    
    // Save progress if user is authenticated
    if (this.authService.isAuthenticated()) {
      this.progressService.saveProgress(
        this.maze.id,
        this.gameState.score,
        this.gameState.timeElapsed,
        this.gameState.bfsUsed
      ).subscribe();
    }
  }
  
  restartLevel(): void {
    this.initializeGameState();
    this.startTime = Date.now();
  }
  
  goToNextLevel(): void {
    let nextLevel = this.levelNumber + 1;
    let nextCategory = this.levelCategory;
    
    // If completed last level in category, go to next category
    if (nextLevel > 5) {
      nextLevel = 1;
      if (this.levelCategory === 'EASY') {
        nextCategory = 'MEDIUM';
      } else if (this.levelCategory === 'MEDIUM') {
        nextCategory = 'HARD';
      } else {
        // If completed all levels, go back to level selection
        this.router.navigate(['/levels']);
        return;
      }
    }
    
    this.router.navigate(['/game', nextCategory.toLowerCase(), nextLevel]);
  }
  
  navigateToLevels(): void {
    this.router.navigate(['/levels']);
  }
  
  getGridTemplateColumns(): string {
    if (!this.gameState) return '';
    
    return `repeat(${this.gameState.maze[0].length}, 40px)`;
  }
}
