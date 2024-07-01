import { leftCoordHitbox, point } from "../../../helpers/interfaces";
import { MovingStuff } from "../../../helpers/moving-stuff";
import { Square } from "../../../helpers/square";
import { TICKS_PER_SECOND } from "../../globals";

export class PowerPoint {
    WIDTH = 12;
    HEIGHT = 14;
    speed = 3;
    capFallSpeed = -2;
    collectSpeed = 10;
    fallAccel = 7;
    tickCounter = 0;
    hitbox: leftCoordHitbox;
    flagForDeletion = false;
    flagForCollection = false;
    constructor(
        private startPosX: number,
        private startPosY: number
    ) {
        this.hitbox = {
            pos: {x: startPosX, y: startPosY},
            width: this.WIDTH,
            height: this.HEIGHT,
        };
        //Start the tick counter on second 1 to make movement pattern start with full velocity
        //this.tickCounter = TICKS_PER_SECOND;
        this.tickCounter = 0;
    }

    move(playerX: number, playerY: number) {
        this.tickCounter++;
        let sec = this.tickCounter/TICKS_PER_SECOND;

        if(this.flagForCollection){
            let velXY = MovingStuff.getXYVelocityTowardDestWithGivenSpeed(this.collectSpeed, this.hitbox.pos, {x: playerX, y: playerY});
            this.hitbox.pos.x += velXY.x;
            this.hitbox.pos.y += velXY.y;
        } else {
            this.hitbox.pos.y -= Math.max(this.speed - (this.fallAccel*sec), this.capFallSpeed);
            this.flagForDeletion = MovingStuff.isHitboxisBelowBottomBound(this.hitbox.pos.y);
        }
    }
}