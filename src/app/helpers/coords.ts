import { PLAYFIELD_HEIGHT, PLAYFIELD_WIDTH } from "../game/globals";
import { leftCoordHitbox, point } from "./interfaces";

export class CoordHelper{
    static isHitboxOutsidePlayArea(p1x: number, p1y: number, height: number, width: number) {
        if ((p1x > PLAYFIELD_WIDTH ||
            p1x + width < 0) ||
            (p1y > PLAYFIELD_HEIGHT ||
            p1y + height < 0)
        ) {
            return true;
        }
        return false;
    }

    static isHitboxisBelowBottomBound(p1y: number) {
        if (p1y > PLAYFIELD_HEIGHT) {
            return true;
        }
        return false;
    }

    static getCenterWithTopLeftHitbox(hitbox: leftCoordHitbox){
        return { x: hitbox.pos.x + (hitbox.width / 2), y: hitbox.pos.y + (hitbox.height / 2)};
    }

    static getCenterWithTopLeftPoint(width: number, height: number, topleftX: number, topleftY: number){
        return { x: topleftX + (width / 2), y: topleftY + (height / 2)};
    }

    static getTopLeftWithCenterPoint(width: number, height: number, centerX: number, centerY: number): point{
        return { x: centerX - (width / 2), y: centerY - (height / 2)};
    }
}