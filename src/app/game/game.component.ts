import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShmupComponent } from './shmup/shmup.component';
import { MenuComponent } from './menu/menu.component';

export enum gameStates {
  title = 'title',
  pause = 'pause',
  L1 = 'L1'
}

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, ShmupComponent, MenuComponent],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent {
  gameState = gameStates.L1;
}
