import { CoordHelper } from "../../../helpers/coords";
import { curvePath, isCurve, leftCoordHitbox, linePath, point } from "../../../helpers/interfaces";
import { MovingStuff } from "../../../helpers/moving-stuff";

export class MoveScript{
    pathMove(path: (linePath | curvePath), hitbox: leftCoordHitbox, center: point): boolean {
        let complete = false;
        if (isCurve(path)) {
            complete = this.moveCurve(path, hitbox);
        } else {
            complete = this.moveLine(path, hitbox);
        }
        //Cannot directly reassign center, as this creates a new object reference. Original class does not update.
        //Only reassign members if trying to pass-by-reference.
        const newCenter = CoordHelper.getCenterWithTopLeftHitbox(hitbox);
        center.x = newCenter.x;
        center.y = newCenter.y;
        return complete;
    }

    private moveLine(path: linePath, hitbox: leftCoordHitbox): boolean {
        MovingStuff.moveTowardsAtConstRate(hitbox.pos, path.dest, path.speed)
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
            this.lengthApproxCalc = MovingStuff.approximateCurveLength(hitbox.pos, path.control, path.dest);
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
            hitbox.pos = MovingStuff.getQuadraticBezierPoint(t, this.curveStart, path.control, path.dest);
            return false;
        }
    }
}