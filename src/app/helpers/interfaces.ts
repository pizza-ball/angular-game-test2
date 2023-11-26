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
  timeAtDestMs?: number
  speed?: number,
}

export interface enemy {
  hitbox: leftCoordHitbox;
  speed: number;
  health: number;
  path: destination[];
  firingSeconds: number[];
}

export enum bulletBehavior{
  atPlayer = 'atPlayer',
  atPoint = 'atPoint',
  atBottom = 'atBottom',
  playerHoming = 'playerHoming',
}

export interface enemyBullet {
  hitbox: leftCoordHitbox;
  speed: number;
  xyVel: point;
  damage: number;
  destination: point;
  behavior: bulletBehavior;
}

