export interface point {
  x: number;
  y: number;
}

export interface leftCoordHitbox {
  xPos: number;
  yPos: number;
  width: number;
  height: number;
}

export interface bullet {
  hitbox: leftCoordHitbox;
  speed: number;
  damage: number;
}

export interface destination {
  loc: point,
  //speed: number,
  //timeAtDestMs: number
}

export interface enemy {
  hitbox: leftCoordHitbox;
  speed: number;
  health: number;
  path: destination[];
  firingSeconds: number[];
}

export enum bulletBehavior{
  linear = 'linear',
  accelerating = 'accelerating',
  homing = 'homing',
}

export interface enemyBullet {
  hitbox: leftCoordHitbox;
  speed: number;
  xyVel: point;
  damage: number;
  destination: point;
  behavior: bulletBehavior;
}

