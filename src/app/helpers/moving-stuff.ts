import { FPS_TARGET, Units } from "../game/globals";
import { CoordHelper } from "./coords";
import { leftCoordHitbox, point } from "./interfaces";

export class MovingStuff {
    static degreesToRadians(angle: number){
        return (Math.PI/180)*angle;
    }

    static moveTowardsAtConstRate(start: point, dest: point, speed: number): void {
        const xDist = dest.x - start.x;
        const yDist = dest.y - start.y;

        const distTotal = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));

        const xRelativeSpeed = (speed / distTotal) * xDist;
        const yRelativeSpeed = (speed / distTotal) * yDist;

        //If speed is too high, we don't want to overshoot the target
        if (Math.abs(xRelativeSpeed) > Math.abs(xDist)) {
            start.x += xDist;
        } else {
            start.x += xRelativeSpeed;
        }

        if (Math.abs(yRelativeSpeed) > Math.abs(yDist)) {
            start.y += yDist;
        } else {
            start.y += yRelativeSpeed;
        }
    }

    static moveToDestInSetTime_Decelerate(x1: number, y1: number, x2: number, y2: number, frame: number, frameTotal: number): point {
        const distTotal = Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
        const xUnit = (x2-x1)/distTotal;
        const yUnit = (y2-y1)/distTotal;

        const v0 = 2*(distTotal/frameTotal);
        const a = -2 * distTotal / (frameTotal*frameTotal);

        const steps = 4;

        let velx = 0;
        let vely = 0;
        let frameStep = 1/steps;

        for(let i = 1; i <= steps; i++){
            frame += frameStep;
            let vMag = v0 + a * frame;
            velx += frameStep * vMag * xUnit;
            vely += frameStep * vMag * yUnit;
        }

        return {x: velx, y: vely};
    }

    static xyVelTowards(speed: number, start: point, dest: point): point {
        const xDist = dest.x - start.x;
        const yDist = dest.y - start.y;

        const distTotal = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));

        const xRelativeSpeed = (speed / distTotal) * xDist;
        const yRelativeSpeed = (speed / distTotal) * yDist;

        return { x: xRelativeSpeed, y: yRelativeSpeed };
    }

    // Function to compute the position on the quadratic Bézier curve
    static getQuadraticBezierPoint(t: number, pos: point, control: point, end: point) {
        const x = (pos.x * Math.pow(1 - t, 2)) + (2 * (1 - t) * t * control.x) + (end.x * Math.pow(t, 2));
        const y = (pos.y * Math.pow(1 - t, 2)) + (2 * (1 - t) * t * control.y) + (end.y * Math.pow(t, 2));
        //const x = (1 - t) * (1 - t) * pos.x + 2 * (1 - t) * t * control.x + t * t * end.x;
        //const y = (1 - t) * (1 - t) * pos.y + 2 * (1 - t) * t * control.y + t * t * end.y;
        return { x, y };
    }

    static approximateCurveLength(start: point, control: point, end: point): number {
        let length = 0;
        let prevPoint = start;
        const steps = 5;

        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const point = this.getQuadraticBezierPoint(t, start, control, end);
            const dx = point.x - prevPoint.x;
            const dy = point.y - prevPoint.y;
            length += Math.sqrt(dx * dx + dy * dy);
            prevPoint = point;
        }

        return length;
    }

    static getRandomPositiveInt(max: number) {
        return Math.floor(Math.random() * max);
    }

    static getRandomInt(max: number) {
        if (Math.floor(Math.random() * 2) === 1) {
            return -1 * Math.floor(Math.random() * max);
        } else {
            return Math.floor(Math.random() * max);
        }
    }

    static calculateRadianAngleBetweenTwoPoints(p1x: number, p1y: number, p2x: number, p2y: number) {
        return Math.atan2(p2y - p1y, p2x - p1x);
    }

    static calcPointOnCircle_Radians(radians: number, radius: number): point {
        return { x: radius * Math.cos(radians), y: radius * Math.sin(radians) };
    }

    static calcPointOnCircle_Degrees(degrees: number, radius: number): point {
        return { x: radius * Math.cos((Math.PI / 180) * degrees), y: radius * Math.sin((Math.PI / 180) * degrees) };
    }

    static calcXOnCircle_Radians(radians: number, radius: number): number {
        return radius * Math.cos(radians);
    }

    static calcYOnCircle_Radians(radians: number, radius: number): number {
        return radius * Math.sin(radians);
    }

    static generateLtoRWanderPath(hitbox: leftCoordHitbox){
        const yRand = MovingStuff.getRandomPositiveInt(6) + 4; //Random int from 4 to 10
        const center = CoordHelper.getTopLeftWithCenterPoint(hitbox.width, hitbox.height, Units.getPlayfieldWidth()*.5, Units.getPlayfieldHeight()/yRand);
        const right = CoordHelper.getTopLeftWithCenterPoint(hitbox.width, hitbox.height, Units.getPlayfieldWidth()*.8, Units.getPlayfieldHeight()/yRand);
        return [
            {
                dest: { x: center.x, y: center.y },
                time: 3*FPS_TARGET,
            },
            {
                dest: { x: right.x, y: right.y },
                time: 3*FPS_TARGET,
            },
        ];
    }

    static generateRtoLWanderPath(hitbox: leftCoordHitbox){
        const yRand = MovingStuff.getRandomPositiveInt(6) + 3; //Random int from 3 to 9
        const center = CoordHelper.getTopLeftWithCenterPoint(hitbox.width, hitbox.height, Units.getPlayfieldWidth()*.5, Units.getPlayfieldHeight()/yRand);
        const left = CoordHelper.getTopLeftWithCenterPoint(hitbox.width, hitbox.height, Units.getPlayfieldWidth()*.2, Units.getPlayfieldHeight()/yRand);
        return [
            {
                dest: { x: center.x, y: center.y },
                time: 3*FPS_TARGET,
            },
            {
                dest: { x: left.x, y: left.y },
                time: 3*FPS_TARGET,
            },
        ];
    }
}