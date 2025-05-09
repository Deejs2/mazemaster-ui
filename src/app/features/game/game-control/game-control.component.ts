import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-game-control',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-control.component.html',
  styleUrl: './game-control.component.scss'
})
export class GameControlComponent {
  @Output() moveUp = new EventEmitter<void>();
  @Output() moveRight = new EventEmitter<void>();
  @Output() moveDown = new EventEmitter<void>();
  @Output() moveLeft = new EventEmitter<void>();
  @Output() useBFS = new EventEmitter<void>();
  
  onMoveUp(): void {
    this.moveUp.emit();
  }
  
  onMoveRight(): void {
    this.moveRight.emit();
  }
  
  onMoveDown(): void {
    this.moveDown.emit();
  }
  
  onMoveLeft(): void {
    this.moveLeft.emit();
  }
  
  onUseBFS(): void {
    this.useBFS.emit();
  }
}

