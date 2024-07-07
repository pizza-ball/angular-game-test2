// Dongler is an enemy that enters from some part of the screen and moves to a destination
// If the destination is off screen, it requests deletion. Otherwise, it remains until killed
// It shoots a simpleBullet

import { CoordHelper } from "../../../helpers/coords";
import { DrawingStuff } from "../../../helpers/drawing-stuff";
import { leftCoordHitbox, linePath, linePathWithPause, point } from "../../../helpers/interfaces";
import { MovingStuff } from "../../../helpers/moving-stuff";
import { DEBUG_MODE, TICKS_PER_SECOND } from "../../globals";
import { Danmaku } from "../bullets/patterns/x-dan";
import { SimpleBullet } from "../bullets/simple-bullet";
import { v4 as uuidv4 } from 'uuid';

// Big enemy with more health, circle bullet pattern.
export class BigBoi {
    public id = uuidv4();
    WIDTH = 76;
    HEIGHT = 76;
    ticksToShoot = [1 * TICKS_PER_SECOND, 2 * TICKS_PER_SECOND, 3 * TICKS_PER_SECOND];
    hitbox: leftCoordHitbox;
    center: point = {x: 0, y: 0};
    health = 50;
    flagForDeletion = false;
    powerCount = 0;
    pointCount = 0;
    constructor(
        private creationTick: number,
        private startX: number,
        private startY: number,
        private path: (linePath | linePathWithPause)[],
        powerCount?: number,
        pointCount?: number
    ) {
        this.hitbox = {
            pos: CoordHelper.getTopLeftWithCenterPoint(this.WIDTH, this.HEIGHT, startX, startY),
            width: this.WIDTH,
            height: this.HEIGHT,
        };
        this.powerCount = 10;
        this.pointCount = 20;

        path.forEach(element => {
            element.dest = CoordHelper.getTopLeftWithCenterPoint(this.WIDTH, this.HEIGHT, element.dest.x, element.dest.y)
        });
        this.center = CoordHelper.getCenterWithTopLeftHitbox(this.hitbox);
    }

    pauseCounter = 0;
    move() {
        if (this.path.length <= 0) {
            this.flagForDeletion = true;
            return;
        }

        if (this.hitbox.pos.x !== this.path[0].dest.x || this.hitbox.pos.y !== this.path[0].dest.y) {
            //console.log("we should be moving towards " + this.path[0]);
            this.hitbox.pos = MovingStuff.moveStartPointTowardDestPoint(this.path[0].speed, this.hitbox.pos, this.path[0].dest);
        } else {
            if ('pauseTimeInSec' in this.path[0] && this.path[0].pauseTimeInSec !== 0 && this.pauseCounter / 60 < this.path[0].pauseTimeInSec) {
                this.pauseCounter++;
            } else {
                this.path.shift();
                this.pauseCounter = 0;
            }
        }
        this.center = CoordHelper.getCenterWithTopLeftHitbox(this.hitbox);
    }

    angles = [45, 135, 225, 315]; // Angle calculations start from the X axis, and move clockwise towards Y. (0,1) is 90*. CAUTION: Y is inverted.
    shoot(currentTick: number, playerPos: point): SimpleBullet | SimpleBullet[] | null {
        const ticksSinceCreation = currentTick - this.creationTick;
        if (!this.ticksToShoot.includes(ticksSinceCreation)) {
            return null;
        }
        const shotCount = 5;
        const shotDensity = 4; // const that manipulates how clustered shots are
        let bullets = Danmaku.circularSpawner( this.angles, shotCount, shotDensity, this.center);
        this.angles = this.angles.map(item => item + 45);   //shifting all angles for next shot.
        return bullets;
    }

    called = false;
    debugDrawPath(ctx: CanvasRenderingContext2D) {
        if (!this.called) {
            DrawingStuff.requestLineDraw(this.id, ctx, this.startX, this.startY, this.path[0].dest.x, this.path[0].dest.y);
            this.called = true;
        }
    }

    cleanUp() {
        if (DEBUG_MODE) {
            DrawingStuff.deleteElementFromMemory(this.id);
        }
    }
}