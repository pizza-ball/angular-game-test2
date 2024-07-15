import { curvePath, leftCoordHitbox, linePath, point } from "../../../helpers/interfaces";
import { SimpleBullet } from "../bullets/simple-bullet";

export abstract class Enemy {
    id = "";
    WIDTH = 0;
    HEIGHT = 0;
    tickToShoot = 0;
    hitbox: leftCoordHitbox;
    health = 0;
    flagForDeletion = false;

    constructor(
        protected creationTick: number,
        protected startX: number,
        protected startY: number,
        protected path?: (linePath | curvePath)[]
    ) {
        this.hitbox = {
            pos: { x: startX, y: startY },
            width: this.WIDTH,
            height: this.HEIGHT,
        };
    }

    abstract move(): void;
 
    abstract shoot(currentTick: number, playerPos: point): SimpleBullet | SimpleBullet[] | null;

    abstract debugDrawPath(ctx: CanvasRenderingContext2D): void;

    abstract cleanUp(): void;
}