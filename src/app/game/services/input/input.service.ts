import { HostListener, Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InputService {
  keysDown = {
    up: false,
    down: false,
    right: false,
    left: false,
    shoot: false,
    pause: false,
    shift: false,
  };

  keysUp = {
    pause: true,
  };

  $paused: Subject<boolean> = new Subject<boolean>();

  constructor() { }

  keyDownHandler(key: string) {
    switch (key) {
      case 'd':
        this.keysDown.right = true;
        break;
      case 'w':
        this.keysDown.up = true;
        break;
      case 'a':
        this.keysDown.left = true;
        break;
      case 's':
        this.keysDown.down = true;
        break;
      case 'k':
        this.keysDown.shoot = true;
        break;
      case 'shift':
        this.keysDown.shift = true;
        break;
      case 'p':
        if (this.keysUp.pause) {
          this.keysDown.pause = !this.keysDown.pause;
          this.keysUp.pause = false;
          this.$paused.next(this.keysDown.pause);
        }
        break;
    }
  }

  keyUpHandler(key: string) {
    switch (key) {
      case 'd':
        this.keysDown.right = false;
        break;
      case 'w':
        this.keysDown.up = false;
        break;
      case 'a':
        this.keysDown.left = false;
        break;
      case 's':
        this.keysDown.down = false;
        break;
      case 'k':
        this.keysDown.shoot = false;
        break;
      case 'p':
        this.keysUp.pause = true;
        break;
      case 'shift':
        this.keysDown.shift = false;
        break;
    }
  }
}
