import { curvePath, isCurve, leftCoordHitbox, linePath, point } from "../../../helpers/interfaces";
import { MovingStuff } from "../../../helpers/moving-stuff";
import { DEBUG_MODE, TICKS_PER_SECOND } from "../../globals";
import { DrawingStuff } from "../../../helpers/drawing-stuff";
import { v4 as uuidv4 } from 'uuid';
import { SimpleBullet } from "../bullets/simple-bullet";


// Shwoop is an enemy that moves linearly, then in an arc. Repeat.
// It fires a stream of projectiles at the player until killed, 1 second after spawning
export class Shwoop {
    public id = uuidv4();
    WIDTH = 30;
    HEIGHT = 30;
    ticksToShoot = [1*TICKS_PER_SECOND];//, 1.2*TICKS_PER_SECOND, 1.4*TICKS_PER_SECOND];
    hitbox: leftCoordHitbox;
    health = 5;
    flagForDeletion = false;
    constructor(
        private creationTick: number,
        private startPos: point,
        private path: (linePath | curvePath)[]
    ) {
        this.hitbox = {
            pos: this.startPos,
            width: this.WIDTH,
            height: this.HEIGHT,
        };
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
    }

    private moveLine(path: linePath) {
        let result = MovingStuff.moveStartPointTowardDestPoint(path.speed, this.hitbox.pos, path.dest)
        if (result.x === path.dest.x && result.y === path.dest.y) {
            this.path.shift();
        } else {
            this.hitbox.pos = result;
        }
    }

    lengthApproxCalc = 0;
    distanceTraveled = 0;
    curveStart = {x: 0, y: 0};
    private moveCurve(path: curvePath) {
        if (this.lengthApproxCalc === 0) {
            this.lengthApproxCalc = MovingStuff.approximateCurveLength(5, this.hitbox.pos, path.control, path.dest);
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
        if(this.ticksToShoot.includes(ticksSinceCreation)){
            const angleToPlayer = MovingStuff.calculateRadianAngleBetweenTwoPoints(this.hitbox.pos.x, this.hitbox.pos.y, playerPos.x, playerPos.y);
            const leftAngle = angleToPlayer - (15)*(Math.PI/180);
            const rightAngle = angleToPlayer + (15)*(Math.PI/180);
            return [
                new SimpleBullet(Object.create(this.hitbox.pos), angleToPlayer),
                new SimpleBullet(Object.create(this.hitbox.pos), leftAngle),
                new SimpleBullet(Object.create(this.hitbox.pos), rightAngle)
            ];
        }
        return null;
    }

    called = false;
    debugDrawPath(ctx: CanvasRenderingContext2D) {
        let startPoint = this.startPos;
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

    cleanUp(ctx: CanvasRenderingContext2D){
        DrawingStuff.deleteElementsAndRedraw(ctx, this.id);
        if(DEBUG_MODE){
            DrawingStuff.deleteElementsAndRedraw(ctx, this.id);
        }
    }
}