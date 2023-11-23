import { destination, leftCoordHitbox, enemy } from './interfaces';


export class linearMovementEnemy implements enemy {
  hitbox: leftCoordHitbox = {
    xPos: -100,
    yPos: 100,
    width: 30,
    height: 30,
  };
  speed: number = 2;
  health: number = 10;
  path: destination[];
  firingSeconds: number[];
  timeOfCreationTicks: number = 0;

  constructor(
    path: destination[],
    firingSeconds: number[],
    timeOfCreationTicks: number,
    speed?: number,
    health?: number,
    hitbox?: leftCoordHitbox
  ) {
    this.path = path;
    this.firingSeconds = firingSeconds;
    this.timeOfCreationTicks = timeOfCreationTicks;
    this.hitbox = hitbox ?? this.hitbox;
    this.speed = speed ?? this.speed;
    this.health = health ?? this.health;
  }

  changeStartingPos(x: number, y: number){
    this.hitbox.xPos = x;
    this.hitbox.yPos = y;
  }

  checkToFire(currentTick: number): boolean{
    let result = false;
    this.firingSeconds.forEach((second)=>{
        //convert seconds to ticks, add them to the time of creation value to find when they should fire
        //TODO: refactor this to be calculated ahead of time
        const secToTicks = this.timeOfCreationTicks + (second * 60);
        //add
        if(secToTicks === currentTick){
            result = true;
        }
    });
    return result;
  }
}
