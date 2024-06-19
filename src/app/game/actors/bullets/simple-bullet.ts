// simpleBullet is a bullet aimed at a set point, and moves linearly towards it with a set speed. 

import { leftCoordHitbox, point } from "../../../helpers/interfaces";
import { MovingStuff } from "../../../helpers/moving-stuff";

// Very basic projectile.
export class SimpleBullet {
    WIDTH = 5;
    HEIGHT = 5;
    speed = 5;
    xyTranslates: point;
    hitbox: leftCoordHitbox;
    constructor(
        private creationTick: number,
        private startPos: point,
        private target: point
    ) {
        this.hitbox = {
            pos: startPos,
            width: this.WIDTH,
            height: this.HEIGHT,
        };
        this.xyTranslates = MovingStuff.getXYVelocityTowardDestWithGivenSpeed(this.speed, startPos, target);
    }

    move() {
        this.hitbox.pos.x += this.xyTranslates.x;
        this.hitbox.pos.y += this.xyTranslates.y;
    }
}