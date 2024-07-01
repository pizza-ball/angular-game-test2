// Dongler is an enemy that enters from some part of the screen and moves to a destination
// If the destination is off screen, it requests deletion. Otherwise, it remains until killed
// It shoots a simpleBullet

import { DrawingStuff } from "../../../helpers/drawing-stuff";
import { curvePath, leftCoordHitbox, linePath, point } from "../../../helpers/interfaces";
import { MovingStuff } from "../../../helpers/moving-stuff";
import { DEBUG_MODE, TICKS_PER_SECOND } from "../../globals";
import { SimpleBullet } from "../bullets/simple-bullet";
import { v4 as uuidv4 } from 'uuid';

// It only shoots if left alive for too long
export class Dongler {
    public id = uuidv4();
    WIDTH = 30;
    HEIGHT = 30;
    tickToShoot = 4 * TICKS_PER_SECOND;
    hitbox: leftCoordHitbox;
    health = 5;
    flagForDeletion = false;
    constructor(
        private creationTick: number,
        private startX: number,
        private startY: number,
        private path: linePath[],
    ) {
        this.hitbox = {
            pos: {x: startX, y: startY},
            width: this.WIDTH,
            height: this.HEIGHT,
        };
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
    }

    shoot(currentTick: number, playerPos: point): SimpleBullet | null {
        const ticksSinceCreation = currentTick - this.creationTick;
        if(ticksSinceCreation === this.tickToShoot){
            const angleToPlayer = MovingStuff.calculateRadianAngleBetweenTwoPoints(this.hitbox.pos.x, this.hitbox.pos.y, playerPos.x, playerPos.y);
            return new SimpleBullet(Object.create(this.hitbox.pos), angleToPlayer);
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

    cleanUp(ctx: CanvasRenderingContext2D){
        if(DEBUG_MODE){
            DrawingStuff.deleteElementFromMemory(this.id);
        }
    }
}