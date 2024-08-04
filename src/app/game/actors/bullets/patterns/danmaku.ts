import { point, point3d } from "../../../../helpers/interfaces";
import { Helper } from "../../../../helpers/moving-stuff";
import { Units } from "../../../globals";
import { BoundBullet, BoundBullet_MoveType } from "../bound-bullet";
import { SimpleBullet } from "../simple-bullet";

export class Danmaku {
    static circularSpawner(angles: number[], shots: number, density: number, origin: point){
        let bulletsToSpawn = [];
        for (let i = 0; i < angles.length; i++) {
            //Clone shotAngles[i] into a new variable so it can be updated without affecting the original array. Starts misaligned on purpose.
            let angleClone = angles[i] - (density*shots);
            for (let j = 0; j < shots; j++) {
                const distFromEnemy = Helper.calcPointOnCircle_Degrees(angleClone, Units.getUnits(50));
                const spawnLocation = { x: origin.x - distFromEnemy.x, y: origin.y - distFromEnemy.y}; //subtract instead of add to create cool effect
                let bul = new SimpleBullet(Object.create(spawnLocation), (Math.PI/180)*angleClone, Units.getUnits(4), Units.getUnits(25))
                bul.spriteData.sprite = "/assets/bullets/bubbles/bubble2.png"
                bulletsToSpawn.push(bul);
                angleClone += density+shots;
            }
        }
        return bulletsToSpawn;
    }

    //Job is to spawn a center point bullet and the 8 vertex bullets.
    static cubeMeme(origin: point, playerPos: point){
        let bulletsToSpawn = [];

        let angleToPlayer = Helper.calculateRadianAngleBetweenTwoPoints(origin.x, origin.y, playerPos.x, playerPos.y);
        let bul = new SimpleBullet(Object.create(origin), angleToPlayer, Units.getUnits(1));
        bul.spriteData.sprite = "/assets/bullets/normal/bullets20.png"
        bulletsToSpawn.push(bul);

        //Creates 8 bullet vertices that represent a cube
        for(let i = 0; i < 8; i++){
            let vert = new BoundBullet(bul.center, BoundBullet_MoveType.cube, Units.getUnits(15));
            let z = Units.getUnits(35);
            if(i > 3){
                z = -z;
                vert.spriteData.sprite = "/assets/bullets/normal/bullets26.png"
            } else{
                vert.spriteData.sprite = "/assets/bullets/normal/bullets22.png"
            }
            vert.setCubeDimensionData('v'+i, z, Units.getUnits(75), Units.getUnits(75), Units.getUnits(3), Units.getUnits(3));
            vert.setCubeRotateData(0, 0, 0, Helper.degToRad(-3), 0, 0);
            vert.setAutoDeleted(false);
            vert.spriteData.sprite = "/assets/bullets/normal/bullets22.png"
            bulletsToSpawn.push(vert);
        }

        return bulletsToSpawn;
    }
}