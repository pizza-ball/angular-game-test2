import { destination, leftCoordHitbox, enemy, bulletBehavior, point } from './interfaces';

export const DEFAULT_ENEMY_HITBOX_SIZE = 30;

export enum enemySprites {
  ratBall = "/assets/ratbubblerun.gif",
  ratUfo = "/assets/ratufo.gif"
}

export class Enemy{
  sprite = enemySprites.ratBall;
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
    sprite: enemySprites,
    firingSeconds: number[],
    timeOfCreationTicks: number,
    shotType: bulletBehavior,
    shootWhere?: point,
    speed?: number,
    health?: number,
    hitbox?: leftCoordHitbox
  ) {
    this.sprite = sprite;
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
      this.firingTicks[i] = this.timeOfCreationTicks + (Math.round(this.firingSeconds[i] * 60));
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
    sprite: enemySprites,
    path: destination[],
    firingSeconds: number[],
    timeOfCreationTicks: number,
    shotType: bulletBehavior,
    shootWhere?: point,
    speed?: number,
    health?: number,
    hitbox?: leftCoordHitbox
  ) {
    super(sprite, firingSeconds, timeOfCreationTicks, shotType, shootWhere, speed, health, hitbox)
    this.path = path;
  }
}
