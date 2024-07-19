import { leftCoordHitbox, point } from "../../../../helpers/interfaces";
import { SimpleBullet } from "../simple-bullet";

export interface BossPhase{
    MAX_HEALTH: number,
    DURATION: number,
    currentHealth: number,
    moveScript(tick: number, bossPos: leftCoordHitbox, playerPos: point): void,
    attackScript(tick: number, bossPos: point, playerPos: point): SimpleBullet|SimpleBullet[]|null
}