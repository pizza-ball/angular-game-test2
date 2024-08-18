import { point, point3d } from "../../../../helpers/interfaces";
import { Helper } from "../../../../helpers/moving-stuff";
import { Units } from "../../../globals";
import { BoundBullet, BoundBullet_MoveType } from "../bound-bullet";
import { SoloBullet } from "../solo-bullet";

export class Danmaku {
    static circularSpawner(angles: number[], shots: number, density: number, origin: point){
        let bulletsToSpawn = [];
        for (let i = 0; i < angles.length; i++) {
            //Clone shotAngles[i] into a new variable so it can be updated without affecting the original array. Starts misaligned on purpose.
            let angleClone = angles[i] - (density*shots);
            for (let j = 0; j < shots; j++) {
                const distFromEnemy = Helper.calcPointOnCircle_Degrees(angleClone, Units.getUnits(50));
                const spawnLocation = { x: origin.x - distFromEnemy.x, y: origin.y - distFromEnemy.y}; //subtract instead of add to create cool effect
                let bul = new SoloBullet(Object.create(spawnLocation), (Math.PI/180)*angleClone, Units.getUnits(4), Units.getUnits(25))
                bul.spriteData.sprite = "/assets/bullets/bubbles/bubble2.png"
                bulletsToSpawn.push(bul);
                angleClone += density+shots;
            }
        }
        return bulletsToSpawn;
    }

    //Creates an 8 bullet cube around the owner point.
    static generateBoundCube(ownerCenter: point, width: number, height: number, length: number, xR: number, yR: number, zR: number){
        let bulletsToSpawn = [];

        for(let i = 0; i < 8; i++){
            let vert = new BoundBullet(ownerCenter, BoundBullet_MoveType.cube, Units.getUnits(10));
            let z = length;
            if(i > 3){
                z = -z;
                vert.spriteData.sprite = "/assets/bullets/normal/bullets26.png"
            } else{
                vert.spriteData.sprite = "/assets/bullets/normal/bullets22.png"
            }
            vert.setCubeDimensionData('v'+i, z, width, height, Units.getUnits(3), Units.getUnits(3));
            vert.setCubeRotateData(0, 0, 0, Helper.degToRad(xR), Helper.degToRad(yR), Helper.degToRad(zR));
            vert.setAutoDeleted(true);
            bulletsToSpawn.push(vert);
        }

        return bulletsToSpawn;
    }
}