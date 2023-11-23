import { destination, leftCoordHitbox, wayCoolerEnemy } from './interfaces';

export class linearMovementEnemy implements wayCoolerEnemy {
  hitbox: leftCoordHitbox = {
    xPos: -100,
    yPos: 100,
    width: 30,
    height: 30,
  };
  speed: number = 2;
  health: number = 10;
  path: destination[];

  constructor(
    path: destination[],
    speed?: number,
    health?: number,
    hitbox?: leftCoordHitbox
  ) {
    this.path = path;
    this.hitbox = hitbox ?? this.hitbox;
    this.speed = speed ?? this.speed;
    this.health = health ?? this.health;
  }

  changeStartingPos(x: number, y: number){
    this.hitbox.xPos = x;
    this.hitbox.yPos = y;
  }
}
