import { bullet, curvePath, isCurve, leftCoordHitbox, linePath, point } from "../../../helpers/interfaces";
import { MovingStuff } from "../../../helpers/moving-stuff";
import { DEBUG_MODE, FPS_TARGET } from "../../globals";
import { DrawingStuff } from "../../../helpers/drawing-stuff";
import { v4 as uuidv4 } from 'uuid';
import { SimpleBullet } from "../bullets/simple-bullet";
import { CoordHelper } from "../../../helpers/coords";
import { ActorList } from "../actorlist";
import { Enemy } from "./enemy-abstract";

export class Shwoop extends Enemy {
    public id = uuidv4();
    ENEMY_TYPE = ActorList.Shwoop;
    health = 5;
    defeatFlag = false;
    clearFlag = false;
    tickData = {
        now: 0,
        playerPos: {x: 0, y: 0}
    }

    setTickData(tick: number, playerPos: point): void {
        this.tickData.now = tick;
        this.tickData.playerPos = {x: playerPos.x, y: playerPos.y};
    }

    assess(){
        if(this.health <= 0){
            this.defeatFlag = true;
        }

        if(this.path.length <= 0){
            this.clearFlag = true;
        }
    }

    move() {
        if (isCurve(this.path[0])) {
            this.moveCurve(Object.create(this.path[0]));
        } else {
            this.moveLine(Object.create(this.path[0]));
        }
        this.center = CoordHelper.getCenterWithTopLeftHitbox(this.hitbox);
    }

    private moveLine(path: linePath) {
        MovingStuff.moveTowardsAtConstRate(this.hitbox.pos, path.dest, path.speed)
        if (this.hitbox.pos.x === path.dest.x && this.hitbox.pos.y === path.dest.y) {
            this.path.shift();
        }
    }

    lengthApproxCalc = 0;
    distanceTraveled = 0;
    curveStart = { x: 0, y: 0 };
    private moveCurve(path: curvePath) {
        if (this.lengthApproxCalc === 0) {
            this.lengthApproxCalc = MovingStuff.approximateCurveLength(this.hitbox.pos, path.control, path.dest);
            this.curveStart = Object.create(this.hitbox.pos);
        }

        //const deltaTime = (timestamp - lastTimestamp) / 1000;
        //lastTimestamp = timestamp;

        this.distanceTraveled += path.speed;
        const t = this.distanceTraveled / this.lengthApproxCalc;

        if (t > 1) {
            //console.log("dest reached, resetting all local variables");
            this.lengthApproxCalc = 0;
            this.distanceTraveled = 0;
            this.path.shift();
        } else {
            this.hitbox.pos = MovingStuff.getQuadraticBezierPoint(t, this.curveStart, path.control, path.dest);
        }
    }

    ticksToShoot = [1 * FPS_TARGET];//, 1.2*TICKS_PER_SECOND, 1.4*TICKS_PER_SECOND];
    attack(): SimpleBullet | SimpleBullet[] | null {
        const ticksSinceCreation = this.tickData.now - this.creationTick;
        if (this.ticksToShoot.includes(ticksSinceCreation)) {
            const angleToPlayer = MovingStuff.calculateRadianAngleBetweenTwoPoints(this.center.x, this.center.y, this.tickData.playerPos.x, this.tickData.playerPos.y);
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
                    DrawingStuff.requestCurveDraw(this.id, ctx, startPoint.x, startPoint.y, segment.dest.x, segment.dest.y, segment.control.x, segment.control.y);
                    startPoint = segment.dest;
                } else {
                    DrawingStuff.requestLineDraw(this.id, ctx, startPoint.x, startPoint.y, segment.dest.x, segment.dest.y);
                    startPoint = segment.dest;
                }
            });
            this.called = true;
        }
    }

    cleanUp() {
        if (DEBUG_MODE) {
            DrawingStuff.deleteElementFromMemory(this.id);
        }
    }
}