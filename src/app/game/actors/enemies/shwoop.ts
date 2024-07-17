import { bullet, curvePath, isCurve, leftCoordHitbox, linePath, point } from "../../../helpers/interfaces";
import { MovingStuff } from "../../../helpers/moving-stuff";
import { DEBUG_MODE, TICKS_PER_SECOND } from "../../globals";
import { DrawingStuff } from "../../../helpers/drawing-stuff";
import { v4 as uuidv4 } from 'uuid';
import { SimpleBullet } from "../bullets/simple-bullet";
import { CoordHelper } from "../../../helpers/coords";
import { ActorList } from "../actorlist";
import { SoundService } from "../../services/sound/sound.service";

export class Shwoop {
    public id = uuidv4();
    ENEMY_TYPE = ActorList.Shwoop;
    WIDTH = 30;
    HEIGHT = 30;
    ticksToShoot = [1 * TICKS_PER_SECOND];//, 1.2*TICKS_PER_SECOND, 1.4*TICKS_PER_SECOND];
    hitbox: leftCoordHitbox;
    center: point = {x: 0, y: 0};
    health = 5;
    flagForDeletion = false;
    powerCount = 0;
    pointCount = 0;
    constructor(
        private soundService: SoundService,
        private creationTick: number,
        private startX: number,
        private startY: number,
        private path: (linePath | curvePath)[],
        powerCount?: number,
        pointCount?: number
    ) {
        this.hitbox = {
            pos: { x: startX, y: startY },
            width: this.WIDTH,
            height: this.HEIGHT,
        };
        this.powerCount = 2;
        this.pointCount = 3;
        this.center = CoordHelper.getCenterWithTopLeftPoint(this.WIDTH, this.HEIGHT, this.hitbox.pos.x, this.hitbox.pos.y);
    }

    move() {
        if (this.path.length <= 0) {
            this.flagForDeletion = true;
            return;
        }

        if (isCurve(this.path[0])) {
            this.moveCurve(Object.create(this.path[0]));
        } else {
            this.moveLine(Object.create(this.path[0]));
        }
        this.center = CoordHelper.getCenterWithTopLeftPoint(this.WIDTH, this.HEIGHT, this.hitbox.pos.x, this.hitbox.pos.y);
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

    shoot(currentTick: number, playerPos: point): SimpleBullet | SimpleBullet[] | null {
        const ticksSinceCreation = currentTick - this.creationTick;
        if (this.ticksToShoot.includes(ticksSinceCreation)) {
            const angleToPlayer = MovingStuff.calculateRadianAngleBetweenTwoPoints(this.center.x, this.center.y, playerPos.x, playerPos.y);
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

    hitByBullet(bullet: bullet){
        this.health -= bullet.damage;
    }

    isDefeated(){
        if(this.health <= 0){
            return true;
        }
        return false;
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