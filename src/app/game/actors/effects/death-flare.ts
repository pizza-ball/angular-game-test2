import { leftCoordHitbox, point } from "../../../helpers/interfaces";
import { Helper } from "../../../helpers/moving-stuff";
import { Units } from "../../globals";

export class DeathFlare{
    maxOpacity = 2;
    sprite = "/assets/miscsprites/deathexplode2.png";

    width: number = 0;
    height: number = 0;
    topleft: point;
    opacity = .7;

    tick = 0;
    ticksTilDelete = Units.secToTick(.5);
    deleteMe = false;

    constructor(private center: point, private maxWidth: number, private maxHeight: number) {
        this.topleft = {x: center.x, y: center.y};
    }

    animate(){
        if(this.tick > this.ticksTilDelete){
            this.deleteMe = true;
            return;
        }

        this.tick++;

        const percentFinished = (this.tick/this.ticksTilDelete)
        this.width = this.maxWidth * percentFinished;
        this.height = this.maxHeight * percentFinished;
        this.opacity = this.maxOpacity * (1-percentFinished);
        this.topleft = Helper.getTopLeftWithCenterPoint(this.width, this.height, this.center.x, this.center.y);
    }
}