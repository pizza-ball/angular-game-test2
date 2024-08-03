import { CoordHelper } from "../../../helpers/coords";
import { bullet, curvePath, leftCoordHitbox, linePath, point } from "../../../helpers/interfaces";
import { SoundService } from "../../services/sound/sound.service";
import { ActorList } from "../actorlist";
import { BulletAbstract } from "../bullets/bullet-abstract";
import { SimpleBullet } from "../bullets/simple-bullet";

export interface ExternalData_Enemy {
    now: number,
    playerPos: point
}

export abstract class Enemy {
    abstract id: string;
    abstract ENEMY_TYPE: ActorList;
    abstract health: number;
    abstract defeatFlag: boolean;
    abstract clearFlag: boolean;
    hitbox: leftCoordHitbox;
    center: point;
    powerCount: number;
    pointCount: number;
    exData: ExternalData_Enemy = {
        now: 0,
        playerPos: { x: 0, y: 0 }
    }


    constructor(
        protected soundService: SoundService,
        protected creationTick: number,
        protected startX: number,
        protected startY: number,
        protected path: (linePath | curvePath)[],
        width: number,
        height: number,
        powerCount?: number,
        pointCount?: number
    ) {
        this.hitbox = {
            pos: CoordHelper.getTopLeftWithCenterPoint(width, height, startX, startY),
            width: width,
            height: height,
        };
        this.powerCount = powerCount !== undefined ? powerCount : 0;
        this.pointCount = pointCount !== undefined ? pointCount : 0;
        this.center = { x: startX, y: startY };

        path.forEach(element => {
            element.dest = CoordHelper.getTopLeftWithCenterPoint(width, height, element.dest.x, element.dest.y)
        });
    }

    setExternalData(tick: number, playerPos: point): void {
        this.exData.now = tick;
        this.exData.playerPos = { x: playerPos.x, y: playerPos.y };
    }

    abstract assess(): void;

    abstract move(): void;

    abstract attack(): BulletAbstract | BulletAbstract[] | null;

    //Optional functionality. Some enemies should spawn other enemies.
    spawnFriends(): Enemy | Enemy[] | null {
        return null;
    }

    abstract hitByBullet(pBullet: bullet): boolean;

    abstract drawThings(ctx: CanvasRenderingContext2D): void;

    abstract cleanUp(): void;

    // abstract debugDrawPath(ctx: CanvasRenderingContext2D): void;
}