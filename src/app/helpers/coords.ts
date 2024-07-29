import { Units } from "../game/globals";
import { leftCoordHitbox, point } from "./interfaces";

export class CoordHelper{
    static isHitboxOutsidePlayArea(hitbox: leftCoordHitbox) {
        if ((hitbox.pos.x > Units.getPlayfieldWidth() || 
                hitbox.pos.x + hitbox.width < 0) ||
            (hitbox.pos.y > Units.getPlayfieldHeight() ||
                hitbox.pos.y + hitbox.height < 0)
        ) {
            return true;
        }
        return false;
    }

    static isRadiusOfRotationTooLarge(radius: number) {
        if (radius > Units.getPlayfieldHeight()) {
            return true;
        }
        return false;
    }

    static isHitboxisBelowBottomBound(p1y: number) {
        if (p1y > Units.getPlayfieldHeight()) {
            return true;
        }
        return false;
    }

    static getCenterWithTopLeftHitbox(hitbox: leftCoordHitbox): point{
        return { x: hitbox.pos.x + (hitbox.width / 2), y: hitbox.pos.y + (hitbox.height / 2)};
    }

    static getCenterWithTopLeftPoint(width: number, height: number, topleftX: number, topleftY: number): point{
        return { x: topleftX + (width / 2), y: topleftY + (height / 2)};
    }

    static getTopLeftWithCenterPoint(width: number, height: number, centerX: number, centerY: number): point{
        return { x: centerX - (width / 2), y: centerY - (height / 2)};
    }
}