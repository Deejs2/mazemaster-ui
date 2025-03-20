import { Component, HostListener, OnInit } from '@angular/core';
import { MazeLevel, Position } from '../../models/maze.model';
import { MazeService } from '../../services/maze.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-maze',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './maze.component.html',
  styleUrl: './maze.component.scss'
})
export class MazeComponent implements OnInit{

  currentMaze?: MazeLevel;
  playerPosition: Position = { row: 0, col: 0 };
  timer: number = 0;
  private timerInterval?: any;
  isGameCompleted: boolean = false;
  isAutoSolving: boolean = false;

  constructor(private mazeService: MazeService) {}

  ngOnInit() {
    this.loadMaze();
    this.startTimer();
  }

  loadMaze() {
    this.mazeService.getCurrentMaze('HARD', 2).subscribe(response => {
      const maze = response.data[0]; // Extract the first maze from the array
      this.currentMaze = maze;
      if (this.currentMaze) {
        this.playerPosition = {
          row: this.currentMaze.startX,
          col: this.currentMaze.startY
        };
      }
    });
  }

  private startTimer() {
    this.timer = 0;
    this.timerInterval = setInterval(() => {
      if (!this.isGameCompleted) {
        this.timer++;
      }
    }, 1000);
  }

  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.isGameCompleted || this.isAutoSolving || !this.currentMaze) return;

    const newPosition = { ...this.playerPosition };

    switch (event.key) {
      case 'ArrowUp':
        if (this.isValidMove(newPosition.row - 1, newPosition.col)) {
          newPosition.row--;
        }
        break;
      case 'ArrowDown':
        if (this.isValidMove(newPosition.row + 1, newPosition.col)) {
          newPosition.row++;
        }
        break;
      case 'ArrowLeft':
        if (this.isValidMove(newPosition.row, newPosition.col - 1)) {
          newPosition.col--;
        }
        break;
      case 'ArrowRight':
        if (this.isValidMove(newPosition.row, newPosition.col + 1)) {
          newPosition.col++;
        }
        break;
    }

    this.playerPosition = newPosition;
    this.checkWinCondition();
  }

  private isValidMove(row: number, col: number): boolean {
    if (!this.currentMaze) return false;
    return row >= 0 && 
           row < this.currentMaze.mazeData.length && 
           col >= 0 && 
           col < this.currentMaze.mazeData[0].length && 
           this.currentMaze.mazeData[row][col] === 0;
  }

  private checkWinCondition() {
    if (!this.currentMaze) return;
    
    if (this.playerPosition.row === this.currentMaze.endX && 
        this.playerPosition.col === this.currentMaze.endY) {
      this.isGameCompleted = true;
      this.stopTimer();
      alert(`Congratulations! You completed the level in ${this.timer} seconds!`);
    }
  }

  autoSolve() {
    if (!this.currentMaze || this.isGameCompleted) return;
    
    this.isAutoSolving = true;
    const solution = this.findPath();
    
    if (solution) {
      this.animateSolution(solution);
    } else {
      alert('No solution found!');
      this.isAutoSolving = false;
    }
  }

  private findPath(): Position[] | null {
    if (!this.currentMaze) return null;

    const visited = new Set<string>();
    const queue: { position: Position; path: Position[] }[] = [{
      position: { row: this.currentMaze.startX, col: this.currentMaze.startY },
      path: []
    }];

    while (queue.length > 0) {
      const { position, path } = queue.shift()!;
      const key = `${position.row},${position.col}`;

      if (visited.has(key)) continue;
      visited.add(key);

      if (position.row === this.currentMaze.endX && 
          position.col === this.currentMaze.endY) {
        return [...path, position];
      }

      const moves = [
        { row: -1, col: 0 }, // up
        { row: 1, col: 0 },  // down
        { row: 0, col: -1 }, // left
        { row: 0, col: 1 }   // right
      ];

      for (const move of moves) {
        const newRow = position.row + move.row;
        const newCol = position.col + move.col;

        if (this.isValidMove(newRow, newCol)) {
          queue.push({
            position: { row: newRow, col: newCol },
            path: [...path, position]
          });
        }
      }
    }

    return null;
  }

  private animateSolution(path: Position[]) {
    let step = 0;
    const interval = setInterval(() => {
      if (step < path.length) {
        this.playerPosition = path[step];
        step++;
      } else {
        clearInterval(interval);
        this.isAutoSolving = false;
        this.checkWinCondition();
      }
    }, 300);
  }

  resetMaze() {
    this.stopTimer();
    this.loadMaze();
    this.startTimer();
    this.isGameCompleted = false;
  }
  loadNextMaze() {
    this.stopTimer();
    this.loadMaze();
    this.startTimer();
    this.isGameCompleted = false
  }
}