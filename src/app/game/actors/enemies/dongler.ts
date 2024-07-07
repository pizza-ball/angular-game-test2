import { CoordHelper } from "../../../helpers/coords";
import { DrawingStuff } from "../../../helpers/drawing-stuff";
import { leftCoordHitbox, linePath, point } from "../../../helpers/interfaces";
import { MovingStuff } from "../../../helpers/moving-stuff";
import { DEBUG_MODE, TICKS_PER_SECOND } from "../../globals";
import { SimpleBullet } from "../bullets/simple-bullet";
import { v4 as uuidv4 } from 'uuid';

export class Dongler {
    public id = uuidv4();
    WIDTH = 30;
    HEIGHT = 30;
    tickToShoot = 3 * TICKS_PER_SECOND;
    hitbox: leftCoordHitbox;
    center: point = {x: 0, y: 0};
    health = 5;
    flagForDeletion = false;
    powerCount = 0;
    pointCount = 0;
    constructor(
        private creationTick: number,
        private startX: number,
        private startY: number,
        private path: linePath[],
        powerCount?: number,
        pointCount?: number
    ) {
        this.hitbox = {
            pos: {x: startX, y: startY},
            width: this.WIDTH,
            height: this.HEIGHT,
        };
        this.powerCount = 2;
        this.pointCount = 3;
        this.center = CoordHelper.getCenterWithTopLeftPoint(this.WIDTH, this.HEIGHT, this.hitbox.pos.x, this.hitbox.pos.y);
    }

    move() {
        const result = MovingStuff.moveStartPointTowardDestPoint(
            this.path[0].speed,
            this.hitbox.pos,
            this.path[0].dest
        );
        this.hitbox.pos = result;

        if(this.hitbox.pos.x === this.path[0].dest.x && this.hitbox.pos.y === this.path[0].dest.y){
            this.flagForDeletion = true;
        }
        this.center = CoordHelper.getCenterWithTopLeftPoint(this.WIDTH, this.HEIGHT, this.hitbox.pos.x, this.hitbox.pos.y);
    }

    shoot(currentTick: number, playerPos: point): SimpleBullet | null {
        const ticksSinceCreation = currentTick - this.creationTick;
        if(ticksSinceCreation === this.tickToShoot){
            const angleToPlayer = MovingStuff.calculateRadianAngleBetweenTwoPoints(this.center.x, this.center.y, playerPos.x, playerPos.y);
            return new SimpleBullet(Object.create(this.center), angleToPlayer, 2);
        }
        return null;
    }

    called = false;
    debugDrawPath(ctx: CanvasRenderingContext2D){
        if(!this.called){
            DrawingStuff.requestLineDraw(this.id, ctx, this.startX, this.startY, this.path[0].dest.x, this.path[0].dest.y);
            this.called = true;
        }
    }

    cleanUp(){
        if(DEBUG_MODE){
            DrawingStuff.deleteElementFromMemory(this.id);
        }
    }
}