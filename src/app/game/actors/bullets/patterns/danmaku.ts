import { CoordHelper } from "../../../../helpers/coords";
import { point, point3d } from "../../../../helpers/interfaces";
import { MovingStuff } from "../../../../helpers/moving-stuff";
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
                const distFromEnemy = MovingStuff.calcPointOnCircle_Degrees(angleClone, Units.getUnits(50));
                const spawnLocation = { x: origin.x - distFromEnemy.x, y: origin.y - distFromEnemy.y}; //subtract instead of add to create cool effect
                let bul = new SimpleBullet(Object.create(spawnLocation), (Math.PI/180)*angleClone, Units.getUnits(4), Units.getUnits(25))
                bul.spriteData.sprite = "/assets/bullets/bubbles/bubble2.png"
                bulletsToSpawn.push(bul);
                angleClone += density+shots;
            }
        }
        return bulletsToSpawn;
    }

    //Job is to spawn a center point bullet and the 8 vertex bullets
    static cubeMeme(origin: point, playerPos: point){
        let bulletsToSpawn = [];

        let angleToPlayer = MovingStuff.calculateRadianAngleBetweenTwoPoints(origin.x, origin.y, playerPos.x, playerPos.y);
        let bul = new SimpleBullet(Object.create(origin), angleToPlayer, Units.getUnits(1));
        bul.spriteData.sprite = "/assets/bullets/normal/bullets20.png"

        for(let i = 0; i < 4; i++){
            let vert = new BoundBullet(bul.center, BoundBullet_MoveType.cube, 15);
            vert.setCubeMovementData('f'+i, 35, 75, 75, 3, 3, 0, 0, 0, MovingStuff.degToRad(-3), 0, 0);
            vert.setAutoDeleted(false);
            vert.spriteData.sprite = "/assets/bullets/normal/bullets22.png"
            bulletsToSpawn.push(vert);
        }
        for(let i = 0; i < 4; i++){
            let vert = new BoundBullet(bul.center, BoundBullet_MoveType.cube, 15);
            vert.setCubeMovementData('b'+i, -35, 75, 75, 3, 3, 0, 0, 0, MovingStuff.degToRad(-3), 0, 0);
            vert.setAutoDeleted(false);
            vert.spriteData.sprite = "/assets/bullets/normal/bullets26.png"
            bulletsToSpawn.push(vert);
        }
        bulletsToSpawn.push(bul);

        return bulletsToSpawn;
    }

    static rotateCubeVertex(vertex: point3d, xTheta: number, yTheta: number, zTheta: number){
        const xRotation = [[1, 0, 0],[0, Math.cos(xTheta), -Math.sin(xTheta)],[0, Math.sin(xTheta), Math.cos(xTheta)]];
        const yRotation = [[Math.cos(yTheta), 0, Math.sin(yTheta)],[0, 1, 0],[-Math.sin(yTheta), 0, Math.cos(yTheta)]];
        const zRotation = [[Math.cos(zTheta), -Math.sin(zTheta), 0],[Math.sin(zTheta), Math.cos(zTheta), 0],[0, 0, 1]];

        const killMe = [xRotation, yRotation, zRotation];
        let result = [[vertex.x],[vertex.y],[vertex.z]]; //Starting point.
        for(let matrix of killMe){
            result = this.matrixMult(matrix, result);
        }
        return {x: result[0][0], y: result[1][0], z: result[2][0]};

        // w = P*x*y*z*vertex
        // Before projecting to 2d, we may need to save Z to some other place, for scaling purposes?
        // let w = this.matrixMult(projectionMatrix, this.matrixMult(xRotation, this.matrixMult(yRotation, this.matrixMult(zRotation,vertMatrix))));
        // return {x: w[0][0], y: w[1][0]};
    }

    static projectMatrixTo2d(vertex: point3d){
        const projectionMatrix = [[1, 0, 0],[0, 1, 0]];
        const result = [[vertex.x],[vertex.y],[vertex.z]];
        let twodee = this.matrixMult(projectionMatrix, result);
        return {x: twodee[0][0], y: twodee[1][0]};
    }

    static matrixMult(m1: number[][], m2: number[][]): number[][]{
        if(m1[0].length !== m2.length){
            console.error("INVALID MATRIX MULT: Dot product length mismatch.");
        }

        let newMatrix: number[][] = [];

        for(let row = 0; row < m1.length; row++){
            newMatrix.push([]);
            for(let col = 0; col < m2[0].length; col++){
                let total = 0;
                for(let i = 0; i < m1[row].length; i++){
                    total = total + (m1[row][i] * m2[i][col])
                }
                //we have one number for the new matrix at [row][col]
                newMatrix[row][col] = total;
            }
        }
        return newMatrix;
    }
}