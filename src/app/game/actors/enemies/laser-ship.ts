import { bullet, curvePath, isCurve, leftCoordHitbox, linePath, point } from "../../../helpers/interfaces";
import { Helper } from "../../../helpers/moving-stuff";
import { DEBUG_MODE, Units } from "../../globals";
import { CanvasDraw } from "../../../helpers/canvas-draw";
import { v4 as uuidv4 } from 'uuid';
import { ActorList } from "../actorlist";
import { Enemy } from "./enemy-abstract";
import { MoveScript } from "./movescript-default";
import { BulletAbstract } from "../bullets/bullet-abstract";
import { SoloBullet } from "../bullets/solo-bullet";
import { Danmaku } from "../bullets/patterns/danmaku";
import { Laser } from "../bullets/patterns/laser";

export class LaserShip extends Enemy {
    public id = uuidv4();
    ENEMY_TYPE = ActorList.LaserShip;
    health = 25;
    defeatFlag = false;
    clearFlag = false;

    //Horrible, but required.
    moveScript = new MoveScript({
        x: Helper.getTopLeftWithCenterPoint(this.hitbox.width, this.hitbox.height, this.startX, this.startY).x
        , y: Helper.getTopLeftWithCenterPoint(this.hitbox.width, this.hitbox.height, this.startX, this.startY).y
    });

    assess() {
        if (this.health <= 0) {
            this.defeatFlag = true;
            for (let bul of this.laserBulletRecord) {
                bul.flagForDeletion = true;
            }
        }

        if (this.path.length <= 0) {
            this.clearFlag = true;
        }
    }

    move() {
        let isDone = this.moveScript.pathMove(this.path[0], this.hitbox, this.center);
        if (isDone) {
            this.path.shift();
        }
    }

    laser1 = new Laser();
    laser2 = new Laser();
    shootTime1 = Units.secToTick(1.1);
    chargeDuration = Units.secToTick(.3);
    fireDuration = Units.secToTick(1.5);
    laserBulletRecord: SoloBullet[] = [];
    attack(): BulletAbstract | BulletAbstract[] | null {
        let bullets: SoloBullet[] = []
        const ticksSinceCreation = this.exData.now - this.creationTick;

        if (ticksSinceCreation > this.shootTime1 && ticksSinceCreation < (this.shootTime1 + this.chargeDuration + this.fireDuration)) {
            const relativeTick = ticksSinceCreation - this.shootTime1;
            let laserLeft = this.laser1.attackScript(relativeTick, this.chargeDuration, this.fireDuration, { x: this.center.x - this.hitbox.width / 2, y: this.center.y + this.hitbox.height / 2 }, 90, Units.getUnits(25));
            let laserRight = this.laser2.attackScript(relativeTick, this.chargeDuration, this.fireDuration, { x: this.center.x + this.hitbox.width / 2, y: this.center.y + this.hitbox.height / 2 }, 90, Units.getUnits(25));

            bullets.push(...laserLeft);
            bullets.push(...laserRight);
            this.laserBulletRecord.push(...laserLeft);
            this.laserBulletRecord.push(...laserRight);
        }

        //Create triplets of bullets that fire in angle increments away from the center of the enemy.
        //These two ifs do way too much manual object creation, changing the bullet density would be a pain in the ass. Too bad!
        if (ticksSinceCreation === Math.round(this.shootTime1 + this.chargeDuration)) {
            let triangleBuls = [
                new SoloBullet({ x: this.center.x, y: this.center.y }, Helper.degToRad(25), Units.getUnits(3)),
                new SoloBullet({ x: this.center.x, y: this.center.y }, Helper.degToRad(40), Units.getUnits(3)),
                new SoloBullet({ x: this.center.x, y: this.center.y }, Helper.degToRad(55), Units.getUnits(3)),
                new SoloBullet({ x: this.center.x, y: this.center.y }, Helper.degToRad(125), Units.getUnits(3)),
                new SoloBullet({ x: this.center.x, y: this.center.y }, Helper.degToRad(140), Units.getUnits(3)),
                new SoloBullet({ x: this.center.x, y: this.center.y }, Helper.degToRad(155), Units.getUnits(3)),
            ];
            for (let bul of triangleBuls) {
                bul.spriteData.sprite = "/assets/bullets/normal/bullets19.png";
            }
            bullets.push(...triangleBuls);
        }

        if (ticksSinceCreation === Math.round(this.shootTime1 + this.chargeDuration) + Units.secToTick(.1)) {

            let bonusbuls = [
                new SoloBullet({ x: this.center.x, y: this.center.y }, Helper.degToRad(27), Units.getUnits(3)),
                new SoloBullet({ x: this.center.x, y: this.center.y }, Helper.degToRad(23), Units.getUnits(3)),

                new SoloBullet({ x: this.center.x, y: this.center.y }, Helper.degToRad(38), Units.getUnits(3)),
                new SoloBullet({ x: this.center.x, y: this.center.y }, Helper.degToRad(42), Units.getUnits(3)),

                new SoloBullet({ x: this.center.x, y: this.center.y }, Helper.degToRad(53), Units.getUnits(3)),
                new SoloBullet({ x: this.center.x, y: this.center.y }, Helper.degToRad(57), Units.getUnits(3)),

                new SoloBullet({ x: this.center.x, y: this.center.y }, Helper.degToRad(123), Units.getUnits(3)),
                new SoloBullet({ x: this.center.x, y: this.center.y }, Helper.degToRad(127), Units.getUnits(3)),

                new SoloBullet({ x: this.center.x, y: this.center.y }, Helper.degToRad(138), Units.getUnits(3)),
                new SoloBullet({ x: this.center.x, y: this.center.y }, Helper.degToRad(142), Units.getUnits(3)),

                new SoloBullet({ x: this.center.x, y: this.center.y }, Helper.degToRad(153), Units.getUnits(3)),
                new SoloBullet({ x: this.center.x, y: this.center.y }, Helper.degToRad(157), Units.getUnits(3)),
            ];
            for (let bul of bonusbuls) {
                bul.spriteData.sprite = "/assets/bullets/normal/bullets19.png";
            }
            bullets.push(...bonusbuls);
        }

        return bullets;
    }

    hitByBullet(pBullet: bullet) {
        if (this.health <= 0) {
            return false;
        }
        this.health -= pBullet.damage;
        return true;
    }

    drawThings(ctx: CanvasRenderingContext2D) {
        if (DEBUG_MODE) {
            this.debugDrawPath(ctx);
        }
    }

    called = false;
    debugDrawPath(ctx: CanvasRenderingContext2D) {
        let startPoint = { x: this.startX, y: this.startY };
        if (!this.called) {
            this.path.forEach(segment => {
                if (isCurve(segment)) {
                    CanvasDraw.requestCurveDraw(this.id, ctx, startPoint.x, startPoint.y, segment.dest.x, segment.dest.y, segment.control.x, segment.control.y);
                    startPoint = segment.dest;
                } else {
                    CanvasDraw.requestLineDraw(this.id, ctx, startPoint.x, startPoint.y, segment.dest.x, segment.dest.y);
                    startPoint = segment.dest;
                }
            });
            this.called = true;
        }
    }

    cleanUp() {
        if (DEBUG_MODE) {
            CanvasDraw.deleteElementFromMemory(this.id);
        }
    }
}