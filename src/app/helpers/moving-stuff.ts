import { point } from "./interfaces";

export class MovingStuff{
    static moveStartPointTowardDestPoint(speed: number, start: point, dest: point): point{
        const xDist = dest.x - start.x;
        const yDist = dest.y - start.y;
    
        const bottom = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
    
        const xRelativeSpeed = (speed/bottom) * xDist;
        const yRelativeSpeed = (speed/bottom) * yDist;

        //If speed is too high, we don't want to overshoot the target
        if(Math.abs(xRelativeSpeed) > Math.abs(xDist)){
            start.x += xDist;
        } else {
            start.x += xRelativeSpeed;
        }

        if(Math.abs(yRelativeSpeed) > Math.abs(yDist)){
            start.y += yDist;
        } else {
            start.y += yRelativeSpeed;
        }
        return {x: start.x, y: start.y};
    }

    static getXYVelocityTowardDestWithGivenSpeed(speed: number, start: point, dest: point): point{
        const xDist = dest.x - start.x;
        const yDist = dest.y - start.y;
    
        const bottom = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
    
        const xRelativeSpeed = (speed/ bottom) * xDist;
        const yRelativeSpeed = (speed / bottom) * yDist;
        
        return {x: xRelativeSpeed, y: yRelativeSpeed};
    }

    static getRandomPositiveInt(max: number) {
        return Math.floor(Math.random() * max);
    }

    static getRandomInt(max: number) {
        if(Math.floor(Math.random() * 2) === 1){
            return -1 * Math.floor(Math.random() * max);
        } else {
            return Math.floor(Math.random() * max);
        }
    }
}