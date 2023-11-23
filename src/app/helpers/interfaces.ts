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

export interface enemy {
  hitbox: leftCoordHitbox;
  speed: number;
  health: number;
  arrivalSide: string;
}

export interface destination {
  loc: point,
  //speed: number,
  //timeAtDestMs: number
}

export interface wayCoolerEnemy {
  hitbox: leftCoordHitbox;
  speed: number;
  health: number;
  path: destination[]
}
