export interface point {
  x: number;
  y: number;
}

export interface point3d {
  x: number;
  y: number;
  z: number;
}

export interface leftCoordHitbox {
  pos: point,
  width: number;
  height: number;
}

export interface leftCoordHitboxId {
  id: string,
  pos: point,
  width: number;
  height: number;
}

export interface bullet {
  hitbox: leftCoordHitbox;
  speed: number;
  damage: number;
}

//Starting position is assumed to be provided by the moving object.
//linePath is the default path.
export interface linePath {
  dest: point,
  speed: number,
  pauseTimeInSec?: number
}

export interface curvePath {
  dest: point,
  control: point,
  speed: number,
  pauseTimeInSec?: number
}

export interface linePath_Decelerate {
  dest: point,
  durationInTicks: number,
  pauseTimeInSec?: number
}

export function isCurve(object: any): object is curvePath {
  return 'control' in object;
}

export function isTimed(object: any): object is linePath_Decelerate {
  return 'durationInTicks' in object;
}