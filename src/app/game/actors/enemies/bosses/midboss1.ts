import { CoordHelper } from "../../../../helpers/coords";
import { DrawingStuff } from "../../../../helpers/drawing-stuff";
import { bullet, leftCoordHitbox, linePath, linePathWithPause, point } from "../../../../helpers/interfaces";
import { MovingStuff } from "../../../../helpers/moving-stuff";
import { DEBUG_MODE, FPS_TARGET } from "../../../globals";
import { SimpleBullet } from "../../bullets/simple-bullet";
import { v4 as uuidv4 } from 'uuid';
import { ActorList } from "../../actorlist";
import { SoundService } from "../../../services/sound/sound.service";
import { BossPhase } from "../../bullets/boss-phases/boss-phase";

export enum bossState {
    entering,
    dialog,
    pause,
    attacking,
    defeated,
    leaving
}

export class MidBoss1 {

}