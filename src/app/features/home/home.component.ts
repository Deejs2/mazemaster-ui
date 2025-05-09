import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  constructor(public authService: AuthService) {}
  
  // Sample maze for display
  demoMaze = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1]
  ];
  
  // Start and end positions
  startPos = { x: 1, y: 1 };
  endPos = { x: 5, y: 5 };
  
  getMazeCellClass(row: number, col: number): string {
    let baseClass = 'maze-cell ';
    
    if (row === this.startPos.y && col === this.startPos.x) {
      return baseClass + 'maze-start';
    } else if (row === this.endPos.y && col === this.endPos.x) {
      return baseClass + 'maze-end';
    } else if (this.demoMaze[row] && this.demoMaze[row][col] === 1) {
      return baseClass + 'maze-wall';
    } else {
      return baseClass + 'maze-path';
    }
  }
}
