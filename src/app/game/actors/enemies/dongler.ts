import { CanvasDraw } from "../../../helpers/canvas-draw";
import { bullet, leftCoordHitbox, linePath, point } from "../../../helpers/interfaces";
import { Helper } from "../../../helpers/moving-stuff";
import { DEBUG_MODE, FPS_TARGET, Units } from "../../globals";
import { SoloBullet } from "../bullets/solo-bullet";
import { v4 as uuidv4 } from 'uuid';
import { ActorList } from "../actorlist";
import { Enemy } from "./enemy-abstract";
import { Danmaku } from "../bullets/patterns/danmaku";
import { BulletAbstract } from "../bullets/bullet-abstract";

export class Dongler extends Enemy {
    public id = uuidv4();
    ENEMY_TYPE = ActorList.Dongler;
    health = 5;
    defeatFlag = false;
    clearFlag = false;

    assess(){
        if(this.health <= 0){
            this.defeatFlag = true;
        }

        if(this.hitbox.pos.x === this.path[0].dest.x && this.hitbox.pos.y === this.path[0].dest.y){
            this.clearFlag = true;
        }
    }

    move() {
        let p = this.path[0] as linePath;
        Helper.moveTowardsAtConstRate(this.hitbox.pos, p.dest, p.speed);

        this.center = Helper.getCenterWithTopLeftHitbox(this.hitbox);
    }

    tickToShoot = 2*FPS_TARGET;
    attack(): SoloBullet | SoloBullet[] | null {
        const ticksSinceCreation = this.exData.now - this.creationTick;
        if(ticksSinceCreation === this.tickToShoot){
            const angleToPlayer = Helper.calculateRadianAngleBetweenTwoPoints(this.center.x, this.center.y, this.exData.playerPos.x, this.exData.playerPos.y);
            this.soundService.enemyBulletSound.play();
            return new SoloBullet(Object.create(this.center), angleToPlayer, Units.getUnits(2));
        }
        return null;
    }

    hitByBullet(pBullet: bullet){
        if(this.health <= 0){
            return false;
        }
        this.health -= pBullet.damage;
        return true;
    }

    drawThings(ctx: CanvasRenderingContext2D){
        if(DEBUG_MODE){
            this.debugDrawPath(ctx);
        }
    }

    called = false;
    debugDrawPath(ctx: CanvasRenderingContext2D){
        if(!this.called){
            CanvasDraw.requestLineDraw(this.id, ctx, this.startX, this.startY, this.path[0].dest.x, this.path[0].dest.y);
            this.called = true;
        }
    }

    cleanUp(){
        if(DEBUG_MODE){
            CanvasDraw.deleteElementFromMemory(this.id);
        }
    }
}