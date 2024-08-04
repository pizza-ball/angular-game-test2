import { FPS_TARGET, Units } from "../game/globals";
import { leftCoordHitbox, point, point3d } from "./interfaces";

export class Helper {
    static degToRad(angle: number) {
        return (Math.PI / 180) * angle;
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
        const distTotal = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        const xUnit = (x2 - x1) / distTotal;
        const yUnit = (y2 - y1) / distTotal;

        const v0 = 2 * (distTotal / frameTotal);
        const a = -2 * distTotal / (frameTotal * frameTotal);

        const steps = 4;

        let velx = 0;
        let vely = 0;
        let frameStep = 1 / steps;

        for (let i = 1; i <= steps; i++) {
            frame += frameStep;
            let vMag = v0 + a * frame;
            velx += frameStep * vMag * xUnit;
            vely += frameStep * vMag * yUnit;
        }

        return { x: velx, y: vely };
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

    static generateLtoRWanderPath(hitbox: leftCoordHitbox) {
        const yRand = Helper.getRandomPositiveInt(6) + 4; //Random int from 4 to 10
        const center = this.getTopLeftWithCenterPoint(hitbox.width, hitbox.height, Units.getPlayfieldWidth() * .5, Units.getPlayfieldHeight() / yRand);
        const right = this.getTopLeftWithCenterPoint(hitbox.width, hitbox.height, Units.getPlayfieldWidth() * .8, Units.getPlayfieldHeight() / yRand);
        return [
            {
                dest: { x: center.x, y: center.y },
                time: 3 * FPS_TARGET,
            },
            {
                dest: { x: right.x, y: right.y },
                time: 3 * FPS_TARGET,
            },
        ];
    }

    static generateRtoLWanderPath(hitbox: leftCoordHitbox) {
        const yRand = Helper.getRandomPositiveInt(6) + 3; //Random int from 3 to 9
        const center = this.getTopLeftWithCenterPoint(hitbox.width, hitbox.height, Units.getPlayfieldWidth() * .5, Units.getPlayfieldHeight() / yRand);
        const left = this.getTopLeftWithCenterPoint(hitbox.width, hitbox.height, Units.getPlayfieldWidth() * .2, Units.getPlayfieldHeight() / yRand);
        return [
            {
                dest: { x: center.x, y: center.y },
                time: 3 * FPS_TARGET,
            },
            {
                dest: { x: left.x, y: left.y },
                time: 3 * FPS_TARGET,
            },
        ];
    }

    static isHitboxOutsidePlayArea(hitbox: leftCoordHitbox) {
        if ((hitbox.pos.x > Units.getPlayfieldWidth() ||
            hitbox.pos.x + hitbox.width < 0) ||
            (hitbox.pos.y > Units.getPlayfieldHeight() ||
                hitbox.pos.y + hitbox.height < 0)
        ) {
            return true;
        }
        return false;
    }

    static isRadiusOfRotationTooLarge(radius: number) {
        if (radius > Units.getPlayfieldHeight()) {
            return true;
        }
        return false;
    }

    static isHitboxisBelowBottomBound(p1y: number) {
        if (p1y > Units.getPlayfieldHeight()) {
            return true;
        }
        return false;
    }

    static getCenterWithTopLeftHitbox(hitbox: leftCoordHitbox): point {
        return { x: hitbox.pos.x + (hitbox.width / 2), y: hitbox.pos.y + (hitbox.height / 2) };
    }

    static getCenterWithTopLeftPoint(width: number, height: number, topleftX: number, topleftY: number): point {
        return { x: topleftX + (width / 2), y: topleftY + (height / 2) };
    }

    static getTopLeftWithCenterPoint(width: number, height: number, centerX: number, centerY: number): point {
        return { x: centerX - (width / 2), y: centerY - (height / 2) };
    }

    //Rotates a 3d vertex with the given angles.
    static rotateVertex(vertex: point3d, xTheta: number, yTheta: number, zTheta: number): point3d {
        const xRotation = [[1, 0, 0], [0, Math.cos(xTheta), -Math.sin(xTheta)], [0, Math.sin(xTheta), Math.cos(xTheta)]];
        const yRotation = [[Math.cos(yTheta), 0, Math.sin(yTheta)], [0, 1, 0], [-Math.sin(yTheta), 0, Math.cos(yTheta)]];
        const zRotation = [[Math.cos(zTheta), -Math.sin(zTheta), 0], [Math.sin(zTheta), Math.cos(zTheta), 0], [0, 0, 1]];

        const killMe = [xRotation, yRotation, zRotation];
        let result = [[vertex.x], [vertex.y], [vertex.z]]; //Starting point.
        for (let matrix of killMe) {
            result = this.matrixMult(matrix, result);
        }
        return { x: result[0][0], y: result[1][0], z: result[2][0] };
    }

    static matrixMult(m1: number[][], m2: number[][]): number[][] {
        if (m1[0].length !== m2.length) {
            console.error("INVALID MATRIX MULT: Dot product length mismatch.");
        }

        let newMatrix: number[][] = [];

        for (let row = 0; row < m1.length; row++) {
            newMatrix.push([]);
            for (let col = 0; col < m2[0].length; col++) {
                let total = 0;
                for (let i = 0; i < m1[row].length; i++) {
                    total = total + (m1[row][i] * m2[i][col])
                }
                //we have one number for the new matrix at [row][col]
                newMatrix[row][col] = total;
            }
        }
        return newMatrix;
    }
}