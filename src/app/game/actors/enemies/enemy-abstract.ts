import { CoordHelper } from "../../../helpers/coords";
import { bullet, curvePath, leftCoordHitbox, linePath, point } from "../../../helpers/interfaces";
import { SoundService } from "../../services/sound/sound.service";
import { ActorList } from "../actorlist";
import { SimpleBullet } from "../bullets/simple-bullet";

export interface TickData {
    now: number,
    playerPos: point
}

export abstract class Enemy {
    abstract id: string;
    abstract ENEMY_TYPE: ActorList;
    abstract health: number;
    abstract defeatFlag: boolean;
    abstract clearFlag: boolean;
    abstract tickData: TickData;
    hitbox: leftCoordHitbox;
    center: point;
    powerCount: number;
    pointCount: number;


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
        this.center = {x: startX, y: startY};

        path.forEach(element => {
            element.dest = CoordHelper.getTopLeftWithCenterPoint(width, height, element.dest.x, element.dest.y)
        });
    }

    abstract setTickData(tick: number, playerPos: point): void;

    abstract assess(): void;

    abstract move(): void;
 
    abstract attack(): SimpleBullet | SimpleBullet[] | null;

    abstract hitByBullet(pBullet: bullet): boolean;

    abstract drawThings(ctx: CanvasRenderingContext2D): void;

    abstract cleanUp(): void;

    // abstract debugDrawPath(ctx: CanvasRenderingContext2D): void;
}