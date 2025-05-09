import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-level-completed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './level-completed.component.html',
  styleUrl: './level-completed.component.scss'
})
export class LevelCompletedComponent {

    @Input() score: number = 0;
    @Input() timeElapsed: number = 0;
    @Input() bfsUsed: number = 0;
    @Input() levelCategory: string = '';
    @Input() levelNumber: number = 0;
    
    @Output() restart = new EventEmitter<void>();
    @Output() nextLevel = new EventEmitter<void>();
    
    onRestart(): void {
      this.restart.emit();
    }
    
    onNextLevel(): void {
      this.nextLevel.emit();
    }
    
    formatTime(ms: number): string {
      const totalSeconds = Math.floor(ms / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    
    getPerformanceMessage(): string {
      // Determine performance based on score and BFS usage
      if (this.bfsUsed === 0) {
        return 'Outstanding! You solved the maze without using BFS!';
      }
      
      if (this.timeElapsed < 30000) {  // Less than 30 seconds
        return 'Amazing speed! You blazed through this maze!';
      }
      
      if (this.bfsUsed === 1) {
        return 'Great job! You only needed BFS once!';
      }
      
      return 'Well done! Try again to improve your score!';
    }

}
