import { curvePath, isCurve, isTimed, leftCoordHitbox, linePath, linePath_Decelerate, point } from "../../../helpers/interfaces";
import { Helper } from "../../../helpers/moving-stuff";
import { Units } from "../../globals";

export class MoveScript{
    tick = 0;
    pausing = false;
    pauseTimer = 0;
    phaseStartPosition: point;

    constructor(start: point){
        this.phaseStartPosition = {x: start.x, y: start.y};
    }
    
    pathMove(path: (linePath | curvePath | linePath_Decelerate), hitbox: leftCoordHitbox, center: point): boolean {
        
        //Check if unpausing is possible.
        if(this.pausing){
            this.pauseTimer++;
            if ( path.pauseTimeInSec !== undefined && this.pauseTimer > Units.secToTick(path.pauseTimeInSec)) {
                this.pausing = false;
                return true;
            }
            return false;
        }

        this.tick++;
        
        let complete = false;
        if (isCurve(path)) {
            complete = this.moveCurve(path, hitbox);
        } else if (isTimed(path)) {
            complete = this.moveLine_decelerate(path, hitbox, this.phaseStartPosition, this.tick);
        } else {
            complete = this.moveLine(path, hitbox);
        }

        //Cannot directly reassign center, as this creates a new object reference. Original class does not update.
        //Only reassign members if trying to pass-by-reference.
        const newCenter = Helper.getCenterWithTopLeftHitbox(hitbox);
        center.x = newCenter.x;
        center.y = newCenter.y;


        if(complete){
            //Save the current position in case the next path requires this value.
            this.phaseStartPosition = {x: hitbox.pos.x, y: hitbox.pos.y};
            this.tick = 0;

            //Pause the completion of the path if a pauseTimeInSec is present.
            if(path.pauseTimeInSec !== undefined && path.pauseTimeInSec !== 0){
                this.pausing = true;
                this.pauseTimer = 0;
                return false;
            }
        }

        return complete;
    }

    private moveLine(path: linePath, hitbox: leftCoordHitbox): boolean {
        Helper.moveTowardsAtConstRate(hitbox.pos, path.dest, path.speed)
        if (hitbox.pos.x === path.dest.x && hitbox.pos.y === path.dest.y) {
            return true;
        }
        return false;
    }

    lengthApproxCalc = 0;
    distanceTraveled = 0;
    curveStart = { x: 0, y: 0 };
    private moveCurve(path: curvePath, hitbox: leftCoordHitbox): boolean {
        if (this.lengthApproxCalc === 0) {
            this.lengthApproxCalc = Helper.approximateCurveLength(hitbox.pos, path.control, path.dest);
            this.curveStart = Object.create(hitbox.pos);
        }

        //const deltaTime = (timestamp - lastTimestamp) / 1000;
        //lastTimestamp = timestamp;

        this.distanceTraveled += path.speed;
        const t = this.distanceTraveled / this.lengthApproxCalc;

        if (t > 1) {
            this.lengthApproxCalc = 0;
            this.distanceTraveled = 0;
            return true;
        } else {
            hitbox.pos = Helper.getQuadraticBezierPoint(t, this.curveStart, path.control, path.dest);
            return false;
        }
    }

    private moveLine_decelerate(path: linePath_Decelerate, hitbox: leftCoordHitbox, start: point, curTime: number): boolean {
        if(curTime > path.durationInTicks){
            hitbox.pos.x = path.dest.x;
            hitbox.pos.y = path.dest.y;
            return true;
        }

        let vel = Helper.moveToDestInSetTime_Decelerate(start.x, start.y, path.dest.x, path.dest.y, curTime, path.durationInTicks);
        hitbox.pos.x += vel.x;
        hitbox.pos.y += vel.y;
        return false;
    }
}