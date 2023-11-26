import { destination, leftCoordHitbox, enemy, bulletBehavior, point } from './interfaces';

export const DEFAULT_ENEMY_HITBOX_SIZE = 30;

export class Enemy{
  hitbox: leftCoordHitbox = {
    xPos: -90,
    yPos: 100,
    width: DEFAULT_ENEMY_HITBOX_SIZE,
    height: DEFAULT_ENEMY_HITBOX_SIZE,
  };
  speed: number = 2;
  health: number = 10;
  firingSeconds: number[];
  timeOfCreationTicks: number = 0;
  shotType: bulletBehavior;
  shootWhere: point = {x:0,y:0};
  firingTicks: number[] = [];

  constructor(
    firingSeconds: number[],
    timeOfCreationTicks: number,
    shotType: bulletBehavior,
    shootWhere?: point,
    speed?: number,
    health?: number,
    hitbox?: leftCoordHitbox
  ) {
    this.shotType = shotType;
    this.firingSeconds = firingSeconds;
    this.timeOfCreationTicks = timeOfCreationTicks;
    this.hitbox = hitbox ?? this.hitbox;
    this.speed = speed ?? this.speed;
    this.health = health ?? this.health;
    this.shootWhere = shootWhere ?? this.shootWhere;
    this.convertFiringPeriodsToTicks();
  }

  convertFiringPeriodsToTicks(){
    for(let i = 0; i < this.firingSeconds.length; i++){
      this.firingTicks[i] = this.timeOfCreationTicks + (this.firingSeconds[i] * 60);
    }
  }

  changeStartingPos(x: number, y: number){
    this.hitbox.xPos = x;
    this.hitbox.yPos = y;
  }

  checkToFire(currentTick: number): boolean{
    for(let shootTick of this.firingTicks){
      if(shootTick === currentTick){
        return true;
      }
    }
    return false;
  }
}

export class LinearMovementEnemy extends Enemy {
  path: destination[];

  constructor(
    path: destination[],
    firingSeconds: number[],
    timeOfCreationTicks: number,
    shotType: bulletBehavior,
    shootWhere?: point,
    speed?: number,
    health?: number,
    hitbox?: leftCoordHitbox
  ) {
    super(firingSeconds, timeOfCreationTicks, shotType, shootWhere, speed, health, hitbox)
    this.path = path;
  }
}
