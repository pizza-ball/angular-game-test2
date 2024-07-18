import { point } from "../../../../helpers/interfaces";
import { MovingStuff } from "../../../../helpers/moving-stuff";
import { Units } from "../../../globals";
import { SimpleBullet } from "../simple-bullet";

export class Danmaku {
    static circularSpawner(angles: number[], shots: number, density: number, origin: point){
        let bulletsToSpawn = [];
        for (let i = 0; i < angles.length; i++) {
            //Clone shotAngles[i] into a new variable so it can be updated without affecting the original array. Starts misaligned on purpose.
            let angleClone = angles[i] - (density*shots);
            for (let j = 0; j < shots; j++) {
                const distFromEnemy = MovingStuff.calculateXYVelocityWithDegrees(angleClone, Units.getUnits(50));
                const spawnLocation = { x: origin.x - distFromEnemy.x, y: origin.y - distFromEnemy.y}; //subtract instead of add to create cool effect
                bulletsToSpawn.push(new SimpleBullet(Object.create(spawnLocation), (Math.PI/180)*angleClone, Units.getUnits(4), Units.getUnits(30)));
                angleClone += density+shots;
            }
        }
        return bulletsToSpawn;
    }
}