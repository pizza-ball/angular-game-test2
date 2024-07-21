import { CoordHelper } from "../../../../helpers/coords";
import { bullet, leftCoordHitbox, point } from "../../../../helpers/interfaces";
import { Units } from "../../../globals";
import { SoundService } from "../../../services/sound/sound.service";
import { ActorList } from "../../actorlist";
import { BossPhase } from "../../bullets/boss-phases/boss-phase";
import { SimpleBullet } from "../../bullets/simple-bullet";

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
        playerPos: {x: 0, y: 0}
    }
    hitbox: leftCoordHitbox;
    center: point;
    WIDTH = Units.getUnits(60);
    HEIGHT = Units.getUnits(60);
    state: bossState = bossState.entering;
    positionPhaseEndedIn = CoordHelper.getTopLeftWithCenterPoint(this.WIDTH, this.HEIGHT, Units.getPlayfieldWidth(), Units.getUnits(-50));
    DEFAULT_POS = CoordHelper.getTopLeftWithCenterPoint(this.WIDTH, this.HEIGHT, Units.getPlayfieldWidth() * .5, Units.getPlayfieldHeight() * .35);
    defeatFlag = false;
    phaseDefeatFlag = false;
    currentPhase = 0;
    phaseCountdown = '';
    phaseStartTick = 0;

    constructor(
        protected soundService: SoundService,
        protected creationTick: number,
    ) {
        this.hitbox = {
            pos: { x: this.positionPhaseEndedIn.x, y: this.positionPhaseEndedIn.y },
            width: this.WIDTH,
            height: this.HEIGHT,
        };
        this.phaseStartTick = creationTick;
        this.center = CoordHelper.getCenterWithTopLeftHitbox(this.hitbox);
    }

    abstract setExternalData(tick: number, playerPos: point): void;

    abstract assess(): void;

    abstract move(): void;
 
    abstract attack(): SimpleBullet | SimpleBullet[] | null;

    abstract hitByBullet(pBullet: bullet): boolean;

    abstract drawThings(ctx: CanvasRenderingContext2D): void;

    abstract cleanUp(): void;
}