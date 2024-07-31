import { CoordHelper } from "../../../helpers/coords";
import { leftCoordHitbox, point } from "../../../helpers/interfaces";
import { MovingStuff } from "../../../helpers/moving-stuff";
import { FPS_TARGET, Units } from "../../globals";
import { BulletAbstract } from "./bullet-abstract";

export enum BoundBullet_MoveType {
    circle,
}

//Bullet linked to an owner point. Orients itself relative to the owner point's position.
//Owner point may or may not move. Do not re-assign this.owner.
export class BoundBullet extends BulletAbstract {
    DEFAULT_WIDTH = Units.getUnits(10);
    DEFAULT_HEIGHT = Units.getUnits(10);
    xyVel: point = {x: 0, y: 0};
    hitbox: leftCoordHitbox;
    spriteData = {
        sprite: "/assets/bullets/normal/bullets31.png",
        hitbox: {
            pos: {x:0, y:0},
            width: 0,
            height: 0,
        }
    }
    color = "orange";
    center = {x: 0, y: 0};

    autoDelete = true;

    constructor(
        public owner: point,
        public moveType: BoundBullet_MoveType,
        size?: number,
    ) {
        super();
        let width = size !== undefined ? size : this.DEFAULT_WIDTH;
        let height = size !== undefined ? size : this.DEFAULT_HEIGHT;

        this.hitbox = {
            pos: CoordHelper.getTopLeftWithCenterPoint(width, height, 0, 0),
            width: width,
            height: height,
        };

        this.spriteData.hitbox = {
            pos: CoordHelper.getTopLeftWithCenterPoint(width*2.5, height*2.5, 0, 0),
            width: width*2.5,
            height: height*2.5,
        }

        this.center = CoordHelper.getCenterWithTopLeftHitbox(this.hitbox);
    }

    move() {
        if(this.moveType === BoundBullet_MoveType.circle){
            this.circularMove();
            return;
        }
    }

    public circularCfg = {
        initialized: false,
        radius: 0,
        radiusGrowth: 0,
        angle: 0,
        angleIncr: 0
    }
    private circularMove() {
        if(!this.circularCfg.initialized){
            console.error("ERROR: attempting BoundBullet circularMove without setting movement config.");
            return;
        }
        this.xyVel = MovingStuff.calcPointOnCircle_Degrees(this.circularCfg.angle, this.circularCfg.radius);
        const newPos = CoordHelper.getTopLeftWithCenterPoint(this.hitbox.width, this.hitbox.height, this.owner.x + this.xyVel.x, this.owner.y + this.xyVel.y);
        this.hitbox.pos.x = newPos.x;
        this.hitbox.pos.y = newPos.y;

        this.circularCfg.angle += this.circularCfg.angleIncr;
        this.circularCfg.radius += this.circularCfg.radiusGrowth;
        if (this.autoDelete) {
            this.flagForDeletion = CoordHelper.isRadiusOfRotationTooLarge(this.circularCfg.radius);
        }
        const cent = CoordHelper.getCenterWithTopLeftHitbox(this.hitbox);
        this.center.x = cent.x;
        this.center.y = cent.y;
        this.moveSprite();
    }

    setCircularMovementData(r: number, rGrowth: number, angle: number, angleIncr: number){
        this.circularCfg = {
            initialized: true,
            radius: r,
            radiusGrowth: rGrowth,
            angle: angle,
            angleIncr: angleIncr
        }
    }
    
    setAutoDeleted(v: boolean){
        this.autoDelete = v;
    }

    private moveSprite(){
        const newPos = CoordHelper.getTopLeftWithCenterPoint(this.spriteData.hitbox.width, this.spriteData.hitbox.height, this.center.x, this.center.y);
        this.spriteData.hitbox.pos.x = newPos.x;
        this.spriteData.hitbox.pos.y = newPos.y;
    }
}