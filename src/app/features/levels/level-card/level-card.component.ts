import { Component, Input } from '@angular/core';
import { Maze } from '../../../core/models/maze.model';
import { ProgressService } from '../../../core/services/progress.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-level-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './level-card.component.html',
  styleUrl: './level-card.component.scss'
})
export class LevelCardComponent {

  @Input() maze!: Maze;
    @Input() isLocked: boolean = false;
    
    completed: boolean = false;
    
    constructor(private progressService: ProgressService) {}
    
    ngOnInit(): void {
      // Check if level is completed
      this.progressService.hasCompletedLevel(this.maze.id).subscribe({
        next: (completed) => {
          this.completed = completed;
          console.log('Level completed status for maze ID', this.maze.id, ':', completed);
        }
      });
    }

    getDifficultyBadgeClass(): string {
      switch(this.maze.levelCategory) {
        case 'EASY':
          return 'badge-easy';
        case 'MEDIUM':
          return 'badge-medium';
        case 'HARD':
          return 'badge-hard';
        default:
          return '';
      }
    }
    
    getMazeSize(): string {
      // If maze data is available, return actual dimensions
      if (this.maze.mazeData && this.maze.mazeData.length > 0) {
        return `${this.maze.mazeData.length}x${this.maze.mazeData[0].length}`;
      }
      
      // Otherwise provide estimates based on difficulty
      switch(this.maze.levelCategory) {
        case 'EASY':
          return `${5 + this.maze.levelNumber}x${5 + this.maze.levelNumber}`;
        case 'MEDIUM':
          return `${10 + this.maze.levelNumber}x${10 + this.maze.levelNumber}`;
        case 'HARD':
          return `${15 + this.maze.levelNumber}x${15 + this.maze.levelNumber}`;
        default:
          return 'Unknown size';
      }
    }

}
