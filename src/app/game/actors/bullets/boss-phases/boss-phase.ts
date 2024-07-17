import { leftCoordHitbox, point } from "../../../../helpers/interfaces";
import { SimpleBullet } from "../simple-bullet";

export interface BossPhase{
    MAX_HEALTH: number,
    DURATION: number,
    currentHealth: number,
    move(tick: number, bossPos: leftCoordHitbox, playerPos: point): void,
    shoot(tick: number, bossPos: point, playerPos: point): SimpleBullet|SimpleBullet[]|null
}