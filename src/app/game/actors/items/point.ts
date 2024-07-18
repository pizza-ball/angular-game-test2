import { CoordHelper } from "../../../helpers/coords";
import { leftCoordHitbox, point } from "../../../helpers/interfaces";
import { MovingStuff } from "../../../helpers/moving-stuff";
import { Square } from "../../../helpers/square";
import { FPS_TARGET } from "../../globals";

export class Point {
    ITEM_TYPE = "point";
    COLOR = "Purple";
    WIDTH = 12;
    HEIGHT = 14;
    speed = 3;
    capFallSpeed = -2;
    collectSpeed = 10;
    fallAccel = 7;
    tickCounter = 0;
    hitbox: leftCoordHitbox;
    value = 10;
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
        this.tickCounter = 0;
    }

    move(playerX: number, playerY: number) {
        this.tickCounter++;
        let sec = this.tickCounter/FPS_TARGET;

        if(this.flagForCollection){
            let velXY = MovingStuff.xyVelTowards(this.collectSpeed, this.hitbox.pos, {x: playerX, y: playerY});
            this.hitbox.pos.x += velXY.x;
            this.hitbox.pos.y += velXY.y;
        } else {
            this.hitbox.pos.y -= Math.max(this.speed - (this.fallAccel*sec), this.capFallSpeed);
            this.flagForDeletion = CoordHelper.isHitboxisBelowBottomBound(this.hitbox.pos.y);
        }
    }
}