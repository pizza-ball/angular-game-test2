import { point } from "./interfaces";

export class MovingStuff {
    static moveStartPointTowardDestPoint(speed: number, start: point, dest: point): point {
        const xDist = dest.x - start.x;
        const yDist = dest.y - start.y;

        const bottom = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));

        const xRelativeSpeed = (speed / bottom) * xDist;
        const yRelativeSpeed = (speed / bottom) * yDist;

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
        return { x: start.x, y: start.y };
    }

    static getXYVelocityTowardDestWithGivenSpeed(speed: number, start: point, dest: point): point {
        const xDist = dest.x - start.x;
        const yDist = dest.y - start.y;

        const bottom = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));

        const xRelativeSpeed = (speed / bottom) * xDist;
        const yRelativeSpeed = (speed / bottom) * yDist;

        return { x: xRelativeSpeed, y: yRelativeSpeed };
    }

    // Function to compute the position on the quadratic Bézier curve
    static getQuadraticBezierPoint(t: number, pos: point, control: point, end: point) {
        const x = (1 - t) * (1 - t) * pos.x + 2 * (1 - t) * t * control.x + t * t * end.x;
        const y = (1 - t) * (1 - t) * pos.y + 2 * (1 - t) * t * control.y + t * t * end.y;
        return { x, y };
    }

    static approximateCurveLength(steps: number, start: point, control: point, end: point): number {
        let length = 0;
        let prevPoint = start;

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
}