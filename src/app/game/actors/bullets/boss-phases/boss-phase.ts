import { leftCoordHitbox, point } from "../../../../helpers/interfaces";
import { Boss } from "../../enemies/bosses/boss-abstract";
import { Enemy } from "../../enemies/enemy-abstract";
import { SimpleBullet } from "../simple-bullet";

export interface BossPhase{
    MAX_HEALTH: number,
    DURATION: number,
    currentHealth: number,
    moveScript(tick: number, bossPos: leftCoordHitbox, playerPos: point): void,
    attackScript(tick: number, bossPos: point, playerPos: point): SimpleBullet|SimpleBullet[]|null
    spawnScript(tick: number, owner: Boss, playerPos: point): Enemy|Enemy[]|null
}