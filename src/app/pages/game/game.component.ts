import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent implements OnInit {
  maze: string[][] = [];
  playerPosition = { row: 0, col: 0 };
  exitPosition = { row: 0, col: 0 };
  gameCompleted = false;
  timer: number = 0;
  interval: any;

  ngOnInit() {
    this.generateMaze();
    this.startTimer();
  }

  generateMaze() {
    // Example predefined maze (S: Start, E: Exit, 1: Wall, 0: Path)
    this.maze = [
      ['S', '0', '1', '1', '0'],
      ['1', '0', '1', '0', '0'],
      ['1', '0', '0', '0', '0'],
      ['1', '1', '1', '0', '1'],
      ['1', '1', '1', '0', 'E']
    ];

    // Locate the player (S) and exit (E)
    for (let i = 0; i < this.maze.length; i++) {
      for (let j = 0; j < this.maze[i].length; j++) {
        if (this.maze[i][j] === 'S') this.playerPosition = { row: i, col: j };
        if (this.maze[i][j] === 'E') this.exitPosition = { row: i, col: j };
      }
    }
  }

  startTimer() {
    this.timer = 0;
    this.interval = setInterval(() => {
      this.timer++;
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.interval);
  }

  @HostListener('window:keydown', ['$event'])
  movePlayer(event: KeyboardEvent) {
    if (this.gameCompleted) return;

    let { row, col } = this.playerPosition;
    if (event.key === 'ArrowUp' && row > 0 && this.maze[row - 1][col] !== '1') row--;
    if (event.key === 'ArrowDown' && row < this.maze.length - 1 && this.maze[row + 1][col] !== '1') row++;
    if (event.key === 'ArrowLeft' && col > 0 && this.maze[row][col - 1] !== '1') col--;
    if (event.key === 'ArrowRight' && col < this.maze[row].length - 1 && this.maze[row][col + 1] !== '1') col++;

    this.playerPosition = { row, col };

    if (row === this.exitPosition.row && col === this.exitPosition.col) {
      this.gameCompleted = true;
      this.stopTimer();
      alert(`Congratulations! You completed the maze in ${this.timer} seconds.`);
      this.stopTimer();
    }
  }

  solveMaze(): void {
    const directions = [
      { row: -1, col: 0 }, // Up
      { row: 1, col: 0 },  // Down
      { row: 0, col: -1 }, // Left
      { row: 0, col: 1 }   // Right
    ];
  
    let queue: { row: number, col: number, path: { row: number, col: number }[] }[] = [{ row: this.playerPosition.row, col: this.playerPosition.col, path: [] }];
    let visited = new Set([`${this.playerPosition.row},${this.playerPosition.col}`]);
  
    while (queue.length > 0) {
      let current = queue.shift();
      if (!current) continue;
  
      let { row, col, path } = current;
      path = [...path, { row, col }];
  
      if (row === this.exitPosition.row && col === this.exitPosition.col) {
        this.animateSolution(path);
        return;
      }
  
      for (let { row: dr, col: dc } of directions) {
        let newRow = row + dr, newCol = col + dc;
        if (
          newRow >= 0 && newRow < this.maze.length &&
          newCol >= 0 && newCol < this.maze[newRow].length &&
          this.maze[newRow][newCol] !== '1' &&
          !visited.has(`${newRow},${newCol}`)
        ) {
          queue.push({ row: newRow, col: newCol, path });
          visited.add(`${newRow},${newCol}`);
        }
      }
    }
  
    alert("No solution found!");
  }
  
  animateSolution(path: { row: number, col: number }[]) {
    let i = 0;
    const interval = setInterval(() => {
      if (i < path.length) {
        this.playerPosition = { row: path[i].row, col: path[i].col };
        i++;
      } else {
        clearInterval(interval);
        alert(`Maze solved in ${this.timer} seconds!`);
        this.stopTimer();
      }
    }, 300);
  }
  
}