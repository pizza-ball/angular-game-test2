import { bullet, curvePath, isCurve, leftCoordHitbox, linePath, point } from "../../../helpers/interfaces";
import { Helper } from "../../../helpers/moving-stuff";
import { DEBUG_MODE, FPS_TARGET } from "../../globals";
import { CanvasDraw } from "../../../helpers/canvas-draw";
import { v4 as uuidv4 } from 'uuid';
import { SimpleBullet } from "../bullets/simple-bullet";
import { ActorList } from "../actorlist";
import { Enemy } from "./enemy-abstract";
import { MoveScript } from "./movescript-default";

export class Shwoop extends Enemy {
    public id = uuidv4();
    ENEMY_TYPE = ActorList.Shwoop;
    health = 5;
    defeatFlag = false;
    clearFlag = false;
    moveScript = new MoveScript();

    assess(){
        if(this.health <= 0){
            this.defeatFlag = true;
        }

        if(this.path.length <= 0){
            this.clearFlag = true;
        }
    }

    move(){
        let isDone = this.moveScript.pathMove(this.path[0], this.hitbox, this.center);
        if(isDone){
            this.path.shift();
        }
    }

    ticksToShoot = [1 * FPS_TARGET];//, 1.2*TICKS_PER_SECOND, 1.4*TICKS_PER_SECOND];
    attack(): SimpleBullet | SimpleBullet[] | null {
        const ticksSinceCreation = this.exData.now - this.creationTick;
        if (this.ticksToShoot.includes(ticksSinceCreation)) {
            const angleToPlayer = Helper.calculateRadianAngleBetweenTwoPoints(this.center.x, this.center.y, this.exData.playerPos.x, this.exData.playerPos.y);
            const leftAngle = angleToPlayer - (15) * (Math.PI / 180);
            const rightAngle = angleToPlayer + (15) * (Math.PI / 180);
            this.soundService.enemyBulletSound.play();
            return [
                new SimpleBullet(Object.create(this.center), angleToPlayer),
                new SimpleBullet(Object.create(this.center), leftAngle),
                new SimpleBullet(Object.create(this.center), rightAngle)
            ];
        }
        return null;
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
        let startPoint = { x: this.startX, y: this.startY };
        if (!this.called) {
            this.path.forEach(segment => {
                if (isCurve(segment)) {
                    CanvasDraw.requestCurveDraw(this.id, ctx, startPoint.x, startPoint.y, segment.dest.x, segment.dest.y, segment.control.x, segment.control.y);
                    startPoint = segment.dest;
                } else {
                    CanvasDraw.requestLineDraw(this.id, ctx, startPoint.x, startPoint.y, segment.dest.x, segment.dest.y);
                    startPoint = segment.dest;
                }
            });
            this.called = true;
        }
    }

    cleanUp() {
        if (DEBUG_MODE) {
            CanvasDraw.deleteElementFromMemory(this.id);
        }
    }
}