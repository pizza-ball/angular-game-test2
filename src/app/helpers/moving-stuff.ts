import { point } from "./interfaces";

export class MovingStuff{
    static moveStartPointTowardDestPoint(speed: number, start: point, dest: point): point{
        const xDist = dest.x - start.x;
        const yDist = dest.y - start.y;
    
        const bottom = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
    
        const xRelativeSpeed = (speed/ bottom) * xDist;
        const yRelativeSpeed = (speed / bottom) * yDist;
    
        start.x += xRelativeSpeed;
        start.y += yRelativeSpeed;
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
}