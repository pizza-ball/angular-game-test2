import { HostListener, Injectable } from '@angular/core';
import { Subject, map } from 'rxjs';

export interface inputMapping {
  pressed: boolean;
  released: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class InputService {

  actionState = {
    moveUp: { pressed: false, released: false },
    moveDown: { pressed: false, released: false },
    moveRight: { pressed: false, released: false },
    moveLeft: { pressed: false, released: false },
    shoot: { pressed: false, released: false },
    focus: { pressed: false, released: false },
    pause: { pressed: false, released: true }
  }

  //Initialized to default keyboard mappings.
  keyboardMap = new Map<string, inputMapping>([
    ["w", this.actionState.moveUp],
    ["s", this.actionState.moveDown],
    ["a", this.actionState.moveLeft],
    ["d", this.actionState.moveRight],
    ["k", this.actionState.shoot],
    ["shift", this.actionState.focus],
    ["p", this.actionState.pause],
  ]);

  //Initialized to default gamepad mappings. Movement is handled by the leftStick array.
  gamepadMap = new Map<number, inputMapping>([
    [0, this.actionState.shoot],  //B button (Nintendo orientation)
    [4, this.actionState.focus],  //L button
    [9, this.actionState.pause],  //Start button
  ]);


  gamepadConnected = false;
  leftStick = [0, 0];

  $paused: Subject<boolean> = new Subject<boolean>();

  constructor() { }

  keyDownHandler(key: string) {
    let mapping = this.keyboardMap.get(key);

    if(!mapping){
      return;
    }

    if(mapping === this.actionState.pause){
      //Dumb pause handler logic. Prevents spamming pause, a key release is required before it activates again.
      this.dumbPauseHandlerLogic(mapping);
    } else {
      mapping.pressed = true;
    }
  }

  keyUpHandler(key: string) {
    let mapping = this.keyboardMap.get(key);

    if(!mapping){
      return;
    }

    if(mapping === this.actionState.pause){
      //Dumb pause handler logic. Prevents spamming pause, a key release is required before it activates again.
      mapping.released = true;
    } else {
      mapping.pressed = false;
    }
  }

  deadzone = .1;
  stickHandler(axes: readonly number[]) {
    if (Math.abs(axes[0]) < this.deadzone) {
      this.leftStick[0] = 0;
    } else {
      this.leftStick[0] = axes[0];
    }

    if (Math.abs(axes[1]) < this.deadzone) {
      this.leftStick[1] = 0;
    } else {
      this.leftStick[1] = axes[1];
    }
  }

  buttonHandler(buttons: readonly GamepadButton[]) {
    //B 0, A 1, Y 2, X 3, L 4, R 5, LT 6, RT 7, SEL 8, START 9
    for (let i = 0; i < buttons.length; i++) {
      let mapping = this.gamepadMap.get(i);
      if(mapping){
        if(mapping === this.actionState.pause){
          this.dumbPauseHandlerLogicForGamepad(mapping, buttons[i])
        } else {
          mapping.pressed = buttons[i].pressed;
        }
      }
    }
  }

  //Dumb pause handler logic. Prevents spamming pause, a key release is required before it activates again.
  dumbPauseHandlerLogic(mapping: inputMapping){
    if (mapping.released) {
      mapping.pressed = !mapping.pressed;
      mapping.released = false;
      this.$paused.next(mapping.pressed);
    }
  }

  dumbPauseHandlerLogicForGamepad(mapping: inputMapping, button: GamepadButton){
    if(mapping.pressed != button.pressed){
      mapping.pressed = button.pressed;
      if(mapping.pressed){
        this.$paused.next(mapping.pressed);
      }
    }
  }
}
