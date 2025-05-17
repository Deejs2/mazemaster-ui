import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-game-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-info.component.html',
  styleUrl: './game-info.component.scss'
})
export class GameInfoComponent {
  @Input() timeElapsed: number = 0;
  @Input() score: number = 0;
  @Input() bfsUsed: number = 0;
  @Input() bfsRemaining: number = 3;

  formatTime(ms: number): string {
    // Cap the timer at 10 minutes (600,000 milliseconds)
    const cappedTime = Math.min(ms, 600000);

    const totalSeconds = Math.floor(cappedTime / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
}