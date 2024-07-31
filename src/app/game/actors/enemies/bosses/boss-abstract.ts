import { CoordHelper } from "../../../../helpers/coords";
import { bullet, leftCoordHitbox, point } from "../../../../helpers/interfaces";
import { Units } from "../../../globals";
import { SoundService } from "../../../services/sound/sound.service";
import { ActorList } from "../../actorlist";
import { BossPhase } from "../../bullets/boss-phases/boss-phase";
import { BulletAbstract } from "../../bullets/bullet-abstract";
import { SimpleBullet } from "../../bullets/simple-bullet";
import { Enemy } from "../enemy-abstract";

export interface ExternalData_Boss {
    now: number,
    playerPos: point,
}

export enum bossState {
    entering,
    dialog,
    pause,
    attacking,
    leaving
}

export abstract class Boss {
    abstract id: string;
    abstract healthId: string;
    abstract ENEMY_TYPE: ActorList;
    abstract ARRIVAL_DURATION: number;
    abstract PAUSE_DURATION: number;
    abstract phases: BossPhase[];
    powerCount = 20;
    pointCount = 100;

    exData: ExternalData_Boss = {
        now: 0,
        playerPos: { x: 0, y: 0 }
    }
    hitbox: leftCoordHitbox;
    center: point;
    WIDTH = Units.getUnits(60);
    HEIGHT = Units.getUnits(60);
    state: bossState = bossState.entering;
    positionPhaseEndedIn = {x: 0, y: 0};
    DEFAULT_POS = CoordHelper.getTopLeftWithCenterPoint(this.WIDTH, this.HEIGHT, Units.getPlayfieldWidth() * .5, Units.getPlayfieldHeight() * .35);
    defeatFlag = false;
    phaseDefeatFlag = false;
    currentPhase = 0;
    phaseCountdown = '';
    phaseStartTick = 0;

    constructor(
        protected soundService: SoundService,
        protected creationTick: number,
        protected startPos: point,
    ) {
        this.hitbox = {
            pos: { x: startPos.x, y: startPos.y },
            width: this.WIDTH,
            height: this.HEIGHT,
        };
        this.positionPhaseEndedIn = startPos;
        this.phaseStartTick = creationTick;
        this.center = CoordHelper.getCenterWithTopLeftHitbox(this.hitbox);
    }

    setExternalData(tick: number, playerPos: point): void {
        this.exData.now = tick;
        this.exData.playerPos = {x: playerPos.x, y: playerPos.y};
    }

    getPhaseTime(){
        return this.exData.now - this.phaseStartTick;
    }

    abstract assess(): void;

    abstract move(): void;

    abstract attack(): BulletAbstract | BulletAbstract[] | null;

    //Optional functionality. Some attacks should spawn other enemies. For bosses, this will usually be BulletDrones.
    spawnFriends(): Enemy | Enemy[] | null {
        return null;
    }

    abstract hitByBullet(pBullet: bullet): boolean;

    abstract drawThings(ctx: CanvasRenderingContext2D): void;

    abstract cleanUp(): void;
}