import { CoordHelper } from "../../../helpers/coords";
import { DrawingStuff } from "../../../helpers/drawing-stuff";
import { bullet, leftCoordHitbox, linePath, point } from "../../../helpers/interfaces";
import { MovingStuff } from "../../../helpers/moving-stuff";
import { DEBUG_MODE, FPS_TARGET, Units } from "../../globals";
import { Danmaku } from "../bullets/patterns/x-dan";
import { SimpleBullet } from "../bullets/simple-bullet";
import { v4 as uuidv4 } from 'uuid';
import { ActorList } from "../actorlist";
import { Enemy } from "./enemy-abstract";

// Big enemy with more health, circle bullet pattern.
export class BigBoi extends Enemy {
    public id = uuidv4();
    ENEMY_TYPE = ActorList.BigBoi;
    health = 50;
    defeatFlag = false;
    clearFlag = false;
    pauseCounter = 0;

    assess(){
        if(this.health <= 0){
            this.defeatFlag = true;
        }

        if(this.path.length <= 0){
            this.clearFlag = true;
        }
    }

    move() {
        if (this.hitbox.pos.x !== this.path[0].dest.x || this.hitbox.pos.y !== this.path[0].dest.y) {
            //console.log("we should be moving towards " + this.path[0]);
            MovingStuff.moveTowardsAtConstRate(this.hitbox.pos, this.path[0].dest, this.path[0].speed);
        } else {
            if (this.path[0].pauseTimeInSec !== undefined && this.path[0].pauseTimeInSec !== 0 && this.pauseCounter / FPS_TARGET < this.path[0].pauseTimeInSec) {
                this.pauseCounter++;
            } else {
                this.path.shift();
                this.pauseCounter = 0;
            }
        }
        this.center = CoordHelper.getCenterWithTopLeftHitbox(this.hitbox);
    }

    ticksToShoot = [1 * FPS_TARGET, 2 * FPS_TARGET, 3 * FPS_TARGET];
    angles = [45, 135, 225, 315]; // Angle calculations start from the X axis, and move clockwise towards Y. (0,1) is 90*. CAUTION: Y is inverted.
    attack(): SimpleBullet | SimpleBullet[] | null {
        const ticksSinceCreation = this.exData.now - this.creationTick;
        if (!this.ticksToShoot.includes(ticksSinceCreation)) {
            return null;
        }
        const shotCount = 5;
        const shotDensity = 4; // const that manipulates how clustered shots are
        let bullets = Danmaku.circularSpawner( this.angles, shotCount, shotDensity, this.center);
        this.angles = this.angles.map(item => item + 45);   //shifting all angles for next shot.
        this.soundService.enemyBulletSound.play();
        return bullets;
    }

    hitByBullet(pBullet: bullet){
        if(this.health <= 0){
            return false;
        }
        this.health -= pBullet.damage;
        return true;
    }

    drawThings(ctx: CanvasRenderingContext2D){
        if(DEBUG_MODE){
            this.debugDrawPath(ctx);
        }
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