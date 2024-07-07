// simpleBullet is a bullet aimed at a set point, and moves linearly towards it with a set speed. 

import { CoordHelper } from "../../../helpers/coords";
import { leftCoordHitbox, point } from "../../../helpers/interfaces";
import { MovingStuff } from "../../../helpers/moving-stuff";

// Very basic projectile.
export class SimpleBullet {
    DEFAULT_WIDTH = 10;
    DEFAULT_HEIGHT = 10;
    DEFAULT_SPEED = 5;
    speed = 0;
    xyTranslates: point;
    hitbox: leftCoordHitbox;
    flagForDeletion = false;
    constructor(
        private startPos: point,
        private angleInRadians: number,
        speed?: number,
        size?: number
    ) {
        this.speed = speed !== undefined ? speed : this.DEFAULT_SPEED;
        let width = size !== undefined ? size : this.DEFAULT_WIDTH;
        let height = size !== undefined ? size : this.DEFAULT_HEIGHT;

        this.hitbox = {
            pos: CoordHelper.getTopLeftWithCenterPoint(width, height, startPos.x, startPos.y),
            width: width,
            height: height,
        };
        this.xyTranslates = MovingStuff.calculateXYVelocityWithRadians(angleInRadians, this.speed);
    }

    move() {
        this.hitbox.pos.x += this.xyTranslates.x;
        this.hitbox.pos.y += this.xyTranslates.y;

        this.flagForDeletion = CoordHelper.isHitboxOutsidePlayArea(this.hitbox.pos.x, this.hitbox.pos.y, this.hitbox.height, this.hitbox.width);
    }
}