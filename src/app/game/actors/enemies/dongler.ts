import { CoordHelper } from "../../../helpers/coords";
import { DrawingStuff } from "../../../helpers/drawing-stuff";
import { bullet, leftCoordHitbox, linePath, point } from "../../../helpers/interfaces";
import { MovingStuff } from "../../../helpers/moving-stuff";
import { DEBUG_MODE, FPS_TARGET, Units } from "../../globals";
import { SimpleBullet } from "../bullets/simple-bullet";
import { v4 as uuidv4 } from 'uuid';
import { ActorList } from "../actorlist";
import { SoundService } from "../../services/sound/sound.service";

export class Dongler {
    public id = uuidv4();
    ENEMY_TYPE = ActorList.Dongler;
    WIDTH = Units.getUnits(30);
    HEIGHT = Units.getUnits(30);
    tickToShoot = 3 * FPS_TARGET;
    hitbox: leftCoordHitbox;
    center: point = {x: 0, y: 0};
    health = 5;
    flagForDeletion = false;
    powerCount = 0;
    pointCount = 0;
    constructor(
        private soundService: SoundService,
        private creationTick: number,
        private startX: number,
        private startY: number,
        private path: linePath[],
        powerCount?: number,
        pointCount?: number
    ) {
        this.hitbox = {
            pos: {x: startX, y: startY},
            width: this.WIDTH,
            height: this.HEIGHT,
        };
        this.powerCount = 1;
        this.pointCount = 3;
        this.center = CoordHelper.getCenterWithTopLeftPoint(this.WIDTH, this.HEIGHT, this.hitbox.pos.x, this.hitbox.pos.y);
    }

    move() {
        MovingStuff.moveTowardsAtConstRate(this.hitbox.pos, this.path[0].dest, this.path[0].speed);

        if(this.hitbox.pos.x === this.path[0].dest.x && this.hitbox.pos.y === this.path[0].dest.y){
            this.flagForDeletion = true;
        }
        this.center = CoordHelper.getCenterWithTopLeftPoint(this.WIDTH, this.HEIGHT, this.hitbox.pos.x, this.hitbox.pos.y);
    }

    shoot(currentTick: number, playerPos: point): SimpleBullet | null {
        const ticksSinceCreation = currentTick - this.creationTick;
        if(ticksSinceCreation === this.tickToShoot){
            const angleToPlayer = MovingStuff.calculateRadianAngleBetweenTwoPoints(this.center.x, this.center.y, playerPos.x, playerPos.y);
            this.soundService.enemyBulletSound.play();
            return new SimpleBullet(Object.create(this.center), angleToPlayer, Units.getUnits(2));
        }
        return null;
    }

    hitByBullet(bullet: bullet){
        this.health -= bullet.damage;
    }

    isDefeated(){
        if(this.health <= 0){
            return true;
        }
        return false;
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