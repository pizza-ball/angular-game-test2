// simpleBullet is a bullet aimed at a set point, and moves linearly towards it with a set speed. 

import { leftCoordHitbox, point } from "../../../helpers/interfaces";
import { MovingStuff } from "../../../helpers/moving-stuff";

// Very basic projectile.
export class SimpleBullet {
    WIDTH = 10;
    HEIGHT = 10;
    speed = 5;
    xyTranslates: point;
    hitbox: leftCoordHitbox;
    flagForDeletion = false;
    constructor(
        private startPos: point,
        private angleInRadians: number,
    ) {
        this.hitbox = {
            pos: startPos,
            width: this.WIDTH,
            height: this.HEIGHT,
        };
        // this.xyTranslates = MovingStuff.getXYVelocityTowardDestWithGivenSpeed(this.speed, startPos, target);
        this.xyTranslates = MovingStuff.calculateXYVelocityInRadianAngle(angleInRadians, this.speed);
    }

    move() {
        this.hitbox.pos.x += this.xyTranslates.x;
        this.hitbox.pos.y += this.xyTranslates.y;

        this.flagForDeletion = MovingStuff.isHitboxOutsidePlayArea(this.hitbox.pos.x, this.hitbox.pos.y, this.HEIGHT, this.WIDTH);
    }
}