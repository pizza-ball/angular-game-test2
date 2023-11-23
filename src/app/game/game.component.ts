import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShmupComponent } from './shmup/shmup.component';
import { MenuComponent } from './menu/menu.component';
import { InputService } from './services/input/input.service';

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
  
  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    this.inputServ.keyDownHandler(event.key.toLowerCase());
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent) {
    this.inputServ.keyUpHandler(event.key.toLowerCase());
  }

  constructor(public inputServ: InputService){}

}
