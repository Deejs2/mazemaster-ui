import { Component, Input } from '@angular/core';
import { MazeCell } from '../../../core/models/maze.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-maze-cell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './maze-cell.component.html',
  styleUrl: './maze-cell.component.scss'
})
export class MazeCellComponent {
  @Input() cell!: MazeCell;
}
