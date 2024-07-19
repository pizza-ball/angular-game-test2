import { CoordHelper } from "../../../helpers/coords";
import { DrawingStuff } from "../../../helpers/drawing-stuff";
import { bullet, leftCoordHitbox, linePath, point } from "../../../helpers/interfaces";
import { MovingStuff } from "../../../helpers/moving-stuff";
import { DEBUG_MODE, FPS_TARGET, Units } from "../../globals";
import { SimpleBullet } from "../bullets/simple-bullet";
import { v4 as uuidv4 } from 'uuid';
import { ActorList } from "../actorlist";
import { Enemy } from "./enemy-abstract";

export class Dongler extends Enemy {
    public id = uuidv4();
    ENEMY_TYPE = ActorList.Dongler;
    health = 5;
    defeatFlag = false;
    clearFlag = false;
    tickData = {
        now: 0,
        playerPos: {x: 0, y: 0}
    }

    setTickData(tick: number, playerPos: point): void {
        this.tickData.now = tick;
        this.tickData.playerPos = {x: playerPos.x, y: playerPos.y};
    }

    assess(){
        if(this.health <= 0){
            this.defeatFlag = true;
        }

        if(this.hitbox.pos.x === this.path[0].dest.x && this.hitbox.pos.y === this.path[0].dest.y){
            this.clearFlag = true;
        }
    }

    move() {
        MovingStuff.moveTowardsAtConstRate(this.hitbox.pos, this.path[0].dest, this.path[0].speed);

        this.center = CoordHelper.getCenterWithTopLeftHitbox(this.hitbox);
    }

    tickToShoot = 2*FPS_TARGET;
    attack(): SimpleBullet | SimpleBullet[] | null {
        const ticksSinceCreation = this.tickData.now - this.creationTick;
        if(ticksSinceCreation === this.tickToShoot){
            const angleToPlayer = MovingStuff.calculateRadianAngleBetweenTwoPoints(this.center.x, this.center.y, this.tickData.playerPos.x, this.tickData.playerPos.y);
            this.soundService.enemyBulletSound.play();
            return new SimpleBullet(Object.create(this.center), angleToPlayer, Units.getUnits(2));
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
            DrawingStuff.requestLineDraw(this.id, ctx, this.startX, this.startY, this.path[0].dest.x, this.path[0].dest.y);
            this.called = true;
        }
    }

    cleanUp(){
        if(DEBUG_MODE){
            DrawingStuff.deleteElementFromMemory(this.id);
        }
    }
}