import { CoordHelper } from "../../../helpers/coords";
import { point, bullet, linePath, curvePath } from "../../../helpers/interfaces";
import { MovingStuff } from "../../../helpers/moving-stuff";
import { FPS_TARGET, Units } from "../../globals";
import { SoundService } from "../../services/sound/sound.service";
import { ActorList } from "../actorlist";
import { SimpleBullet } from "../bullets/simple-bullet";
import { Boss } from "./bosses/boss-abstract";
import { Enemy, ExternalData_Enemy } from "./enemy-abstract";
import { v4 as uuidv4 } from 'uuid';
import { MoveScript } from "./movescript-default";

export class BulletDrone extends Enemy{
    id = uuidv4();
    ENEMY_TYPE = ActorList.BulletDrone;
    health = 1;
    defeatFlag = false;
    clearFlag = false;
    moveScript = new MoveScript();

    constructor(
        soundService: SoundService,
        creationTick: number,
        startX: number,
        startY: number,
        path: (linePath | curvePath)[],
        width: number,
        height: number,
        private owner: Enemy | Boss
    ){
        super(soundService, creationTick, startX, startY, path, width, height);
    }

    assess(): void {
        //Delete the drone if the owner is deleted.
        if(this.owner === undefined){
            this.clearFlag = true;
        }
    }

    move(): void {
        let isDone = this.moveScript.pathMove(this.path[0], this.hitbox, this.center);

        if(isDone){
            this.path.shift();
        }
    }

    tickToShoot = 2 * FPS_TARGET;
    attack(): SimpleBullet | SimpleBullet[] | null {
        if (this.exData.now % this.tickToShoot ||
            (this.exData.now - FPS_TARGET/20) % this.tickToShoot ||
            (this.exData.now - FPS_TARGET/10) % this.tickToShoot
        ){
            if(this.hitbox.pos.x < Units.xFromPct(50)){
                return new SimpleBullet(Object.create(this.center), 0);
            } else {
                return new SimpleBullet(Object.create(this.center), 180);
            }
        }
        return null;
    }

    hitByBullet(pBullet: bullet): boolean {
        return false;
    }

    drawThings(ctx: CanvasRenderingContext2D): void {
        return;
    }

    cleanUp(): void {
        return;
    }
}